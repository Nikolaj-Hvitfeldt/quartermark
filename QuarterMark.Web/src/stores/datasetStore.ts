import { create } from 'zustand';
import { DEFAULT_DATASET_ID, GameDataset, getDataset } from '../data/datasets';

const STORAGE_KEY = 'quartermark-dataset';

const loadDatasetId = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_DATASET_ID;
  } catch {
    return DEFAULT_DATASET_ID;
  }
};

interface DatasetState {
  datasetId: string;
  setDatasetId: (id: string) => void;
}

/** Which dataset the host plays with. Remembered across reloads. */
export const useDatasetStore = create<DatasetState>((set) => ({
  datasetId: loadDatasetId(),
  setDatasetId: (datasetId) => {
    set({ datasetId });
    try {
      localStorage.setItem(STORAGE_KEY, datasetId);
    } catch {
      // Private mode or storage blocked: the choice just won't survive a reload
    }
  },
}));

export const useActiveDataset = (): GameDataset => getDataset(useDatasetStore((s) => s.datasetId));
