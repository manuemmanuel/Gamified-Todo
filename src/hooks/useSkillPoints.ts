import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const useSkillPoints = () => {
  const [skillPoints, setSkillPoints] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSkillPoints = async () => {
      try {
        const supabase = createClientComponentClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setSkillPoints(0);
          return;
        }

        const { data: stats, error } = await supabase
          .from('user_stats')
          .select('skill_points')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        setSkillPoints(stats?.skill_points ?? 0);
      } catch (error) {
        console.error('Error fetching skill points:', error);
        setError(error as Error);
        setSkillPoints(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSkillPoints();
  }, []);

  const refreshSkillPoints = async () => {
    setIsLoading(true);
    const supabase = createClientComponentClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setSkillPoints(0);
      setIsLoading(false);
      return;
    }

    const { data: stats, error } = await supabase
      .from('user_stats')
      .select('skill_points')
      .eq('id', user.id)
      .single();

    if (error) {
      setError(error as Error);
      setSkillPoints(0);
    } else {
      setSkillPoints(stats?.skill_points ?? 0);
    }
    setIsLoading(false);
  };

  return {
    skillPoints,
    isLoading,
    error,
    refreshSkillPoints,
    setSkillPoints: setSkillPoints
  };
}; 