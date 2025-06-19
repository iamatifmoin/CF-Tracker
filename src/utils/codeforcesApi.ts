
export const getCodeforcesRatingTitle = (rating: number): string => {
  if (rating < 1200) return 'newbie';
  if (rating < 1400) return 'pupil';
  if (rating < 1600) return 'specialist';
  if (rating < 1900) return 'expert';
  if (rating < 2100) return 'candidate';
  if (rating < 2400) return 'master';
  if (rating < 3000) return 'grandmaster';
  return 'legendary';
};

export const formatRating = (rating: number): string => {
  return rating.toString();
};

export const getRatingColor = (rating: number): string => {
  const title = getCodeforcesRatingTitle(rating);
  const colors = {
    newbie: '#808080',
    pupil: '#008000',
    specialist: '#03A89E', 
    expert: '#0000FF',
    candidate: '#AA00AA',
    master: '#FF8C00',
    grandmaster: '#FF0000',
    legendary: '#FF0000'
  };
  return colors[title as keyof typeof colors];
};

export const fetchUserInfo = async (handle: string) => {
  try {
    const response = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
    const data = await response.json();
    if (data.status === 'OK') {
      return data.result[0];
    }
    throw new Error(data.comment || 'Failed to fetch user info');
  } catch (error) {
    console.error('Error fetching user info:', error);
    throw error;
  }
};

export const fetchUserRating = async (handle: string) => {
  try {
    const response = await fetch(`https://codeforces.com/api/user.rating?handle=${handle}`);
    const data = await response.json();
    if (data.status === 'OK') {
      return data.result;
    }
    throw new Error(data.comment || 'Failed to fetch user rating');
  } catch (error) {
    console.error('Error fetching user rating:', error);
    throw error;
  }
};

export const fetchUserSubmissions = async (handle: string, count: number = 10000) => {
  try {
    const response = await fetch(`https://codeforces.com/api/user.status?handle=${handle}&from=1&count=${count}`);
    const data = await response.json();
    if (data.status === 'OK') {
      return data.result;
    }
    throw new Error(data.comment || 'Failed to fetch user submissions');
  } catch (error) {
    console.error('Error fetching user submissions:', error);
    throw error;
  }
};
