import './QuestionDisplay.css';

interface QuestionDisplayProps {
  questionText: string;
  imageUrl?: string;
}

export function QuestionDisplay({ questionText, imageUrl }: QuestionDisplayProps) {
  return (
    <div className="question-display">
      {imageUrl && (
        <img src={imageUrl} alt="Question" className="question-image" />
      )}
      <h2 className="question-text">{questionText}</h2>
    </div>
  );
}

