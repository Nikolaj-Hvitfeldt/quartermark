import React, { useState, useEffect } from 'react';
import { PlayerDto } from '../types';
import { WOULD_I_LIE_IMAGES, WouldILieRoundConfig } from '../data/wouldILieImages';
import './WouldILieConfig.css';

interface WouldILieConfigProps {
  players: PlayerDto[];
  onConfigComplete: (config: WouldILieRoundConfig[]) => void;
  existingConfig?: WouldILieRoundConfig[];
}

export function WouldILieConfig({ players, onConfigComplete, existingConfig }: WouldILieConfigProps) {
  const nonHostPlayers = players.filter(p => !p.isHost);
  
  // Initialize config state from existing config or empty
  const [roundConfigs, setRoundConfigs] = useState<Partial<WouldILieRoundConfig>[]>(() => {
    if (existingConfig && existingConfig.length > 0) {
      return existingConfig;
    }
    return WOULD_I_LIE_IMAGES.map(img => ({
      imageId: img.id,
      imageUrl: img.imageUrl,
      truthTeller: '',
      liar: '',
    }));
  });

  const [expandedRound, setExpandedRound] = useState<number | null>(0);

  // Check if at least one round is fully configured
  const configuredRounds = roundConfigs.filter(
    config => config.truthTeller && config.liar && config.truthTeller !== config.liar
  );
  const hasValidConfig = configuredRounds.length > 0;

  const updateRoundConfig = (index: number, field: 'truthTeller' | 'liar', value: string) => {
    setRoundConfigs(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      
      // If setting truth teller and they're currently the liar, clear liar
      if (field === 'truthTeller' && updated[index].liar === value) {
        updated[index].liar = '';
      }
      // If setting liar and they're currently the truth teller, clear truth teller
      if (field === 'liar' && updated[index].truthTeller === value) {
        updated[index].truthTeller = '';
      }
      
      return updated;
    });
  };

  const handleSaveConfig = () => {
    // Only include fully configured rounds
    const validConfigs = roundConfigs.filter(
      (config): config is WouldILieRoundConfig => 
        !!config.truthTeller && 
        !!config.liar && 
        !!config.imageId &&
        !!config.imageUrl &&
        config.truthTeller !== config.liar
    );
    
    if (validConfigs.length > 0) {
      onConfigComplete(validConfigs);
    }
  };

  const getAvailableForLiar = (roundIndex: number) => {
    const truthTeller = roundConfigs[roundIndex]?.truthTeller;
    return nonHostPlayers.filter(p => p.name !== truthTeller);
  };

  if (nonHostPlayers.length < 2) {
    return (
      <div className="would-i-lie-config">
        <div className="config-warning">
          <h3>⚠️ Need More Players</h3>
          <p>You need at least 2 non-host players to configure this game.</p>
          <p>Current non-host players: {nonHostPlayers.length}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="would-i-lie-config">
      <div className="config-header">
        <h3>🎭 Configure "Would I Lie to You?" Rounds</h3>
        <p className="config-hint">
          Assign who knows each person (Truth Teller) and who will make up a story (Liar).
          You can configure as many rounds as you want. At least 1 round is required.
        </p>
      </div>

      <div className="rounds-list">
        {WOULD_I_LIE_IMAGES.map((image, index) => {
          const config = roundConfigs[index];
          const isComplete = config?.truthTeller && config?.liar && config.truthTeller !== config.liar;
          const isExpanded = expandedRound === index;

          return (
            <div 
              key={image.id} 
              className={`round-config-card ${isComplete ? 'complete' : ''} ${isExpanded ? 'expanded' : ''}`}
            >
              <div 
                className="round-header"
                onClick={() => setExpandedRound(isExpanded ? null : index)}
              >
                <div className="round-info">
                  <span className="round-number">Round {index + 1}</span>
                  {isComplete && <span className="complete-badge">✓ Configured</span>}
                </div>
                <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
              </div>

              {isExpanded && (
                <div className="round-body">
                  <div className="image-preview">
                    <img 
                      src={image.imageUrl} 
                      alt={`Round ${index + 1}`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x200?text=Image+' + (index + 1);
                      }}
                    />
                    <p className="image-description">{image.description}</p>
                  </div>

                  <div className="role-selectors">
                    <div className="role-group">
                      <label>🟢 Truth Teller (knows this person):</label>
                      <select
                        value={config?.truthTeller || ''}
                        onChange={(e) => updateRoundConfig(index, 'truthTeller', e.target.value)}
                        className="role-select"
                      >
                        <option value="">Select player...</option>
                        {nonHostPlayers.map(player => (
                          <option key={player.name} value={player.name}>
                            {player.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="role-group">
                      <label>🔴 Liar (will make up a story):</label>
                      <select
                        value={config?.liar || ''}
                        onChange={(e) => updateRoundConfig(index, 'liar', e.target.value)}
                        className="role-select"
                        disabled={!config?.truthTeller}
                      >
                        <option value="">Select player...</option>
                        {getAvailableForLiar(index).map(player => (
                          <option key={player.name} value={player.name}>
                            {player.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="config-footer">
        <div className="config-summary">
          <span className="configured-count">
            {configuredRounds.length} of {WOULD_I_LIE_IMAGES.length} rounds configured
          </span>
        </div>
        <button
          className="btn btn-primary btn-large save-config-btn"
          onClick={handleSaveConfig}
          disabled={!hasValidConfig}
        >
          Save Configuration ({configuredRounds.length} rounds)
        </button>
      </div>
    </div>
  );
}

