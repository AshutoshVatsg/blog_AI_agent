import { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';

const useReadingProgress = (postId, totalParagraphs) => {
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);

  // Load saved progress
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const { data } = await API.get(`/progress/${postId}`);
        if (data.lastParagraphIndex) {
          setProgress(data.lastParagraphIndex);
          setCompleted(data.completed);
        }
      } catch (error) {
        // User might not be logged in
      }
    };
    if (postId) loadProgress();
  }, [postId]);

  // Save progress (debounced)
  const saveProgress = useCallback(
    async (paragraphIndex) => {
      setProgress(paragraphIndex);
      const isCompleted = paragraphIndex >= totalParagraphs - 1;
      setCompleted(isCompleted);

      try {
        await API.post(`/progress/${postId}`, {
          lastParagraphIndex: paragraphIndex,
          completed: isCompleted,
        });
      } catch (error) {
        // Silent fail for non-authenticated users
      }
    },
    [postId, totalParagraphs]
  );

  const percentComplete = totalParagraphs > 0
    ? Math.round(((progress + 1) / totalParagraphs) * 100)
    : 0;

  return { progress, completed, saveProgress, percentComplete };
};

export default useReadingProgress;
