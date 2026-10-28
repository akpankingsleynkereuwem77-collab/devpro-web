const allowedProjectTypes = new Set(['Web Development', 'UI/UX Design', 'Website Maintenance', 'Custom Solution', 'Other']);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const cleanText = (value) => typeof value === 'string' ? value.trim() : '';

export function validateContact(body = {}) {
  const errors = {};
  const name = cleanText(body.name);
  const email = cleanText(body.email);
  const phone = cleanText(body.phone);
  const projectType = cleanText(body.projectType);
  const budget = cleanText(body.budget);
  const message = cleanText(body.message);

  if (name.length < 2 || name.length > 100) errors.name = 'Name must be between 2 and 100 characters.';
  if (email.length > 254 || !emailPattern.test(email)) errors.email = 'Enter a valid email address.';
  if (phone.length > 30) errors.phone = 'Phone number is too long.';
  if (!allowedProjectTypes.has(projectType)) errors.projectType = 'Choose a valid project type.';
  if (budget.length > 80) errors.budget = 'Budget selection is too long.';
  if (message.length < 10 || message.length > 5000) errors.message = 'Message must be between 10 and 5000 characters.';
  return { errors, value: { name, email, phone, projectType, budget, message } };
}

