const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

const validateMeetingInput = (data) => {
  const errors = [];
  
  if (!data.title || data.title.trim().length === 0) {
    errors.push('Meeting title is required');
  }
  
  if (data.title && data.title.length > 200) {
    errors.push('Meeting title must be less than 200 characters');
  }
  
  if (data.startTime && isNaN(new Date(data.startTime).getTime())) {
    errors.push('Invalid start time');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .substring(0, 1000); // Limit length
  }
  return input;
};

module.exports = {
  validateEmail,
  validatePassword,
  validateMeetingInput,
  sanitizeInput
};