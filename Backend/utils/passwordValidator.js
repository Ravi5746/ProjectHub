// Same password rules as server/utils/passwordValidator.js
const PASSWORD_RULES = [
    { test: (pw) => pw.length >= 8, message: 'At least 8 characters' },
    { test: (pw) => /[A-Z]/.test(pw), message: 'At least one uppercase letter' },
    { test: (pw) => /[a-z]/.test(pw), message: 'At least one lowercase letter' },
    { test: (pw) => /[0-9]/.test(pw), message: 'At least one number' },
    { test: (pw) => /[@$!%*?&]/.test(pw), message: 'At least one special character (@$!%*?&)' }
]

export function validatePassword(password) {
    const failures = PASSWORD_RULES.filter(rule => !rule.test(password))
    return {
        isValid: failures.length === 0,
        errors: failures.map(f => f.message)
    }
}
