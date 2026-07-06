export const PASSWORD_RULES = [
    { key: 'length', label: 'At least 8 characters', test: (p) => p.length >= 8 },
    { key: 'lowercase', label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
    { key: 'uppercase', label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
    { key: 'number', label: 'One number', test: (p) => /\d/.test(p) },
    { key: 'symbol', label: 'One special character (!@#$%&*)', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export const getPasswordStrength = (password) => {
    const rules = PASSWORD_RULES.map(rule => ({ ...rule, passed: rule.test(password) }));
    const passedCount = rules.filter(r => r.passed).length;

    let label = '';
    let color = 'text-gray-400';
    if (password.length > 0) {
        if (passedCount <= 2) {
            label = 'Weak';
            color = 'text-red-500';
        } else if (passedCount <= 4) {
            label = 'Fair';
            color = 'text-amber-500';
        } else {
            label = 'Strong';
            color = 'text-emerald-600';
        }
    }

    return {
        rules,
        passedCount,
        total: PASSWORD_RULES.length,
        isStrong: passedCount === PASSWORD_RULES.length,
        label,
        color,
    };
};

export const generateStrongPassword = (length = 14) => {
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghjkmnpqrstuvwxyz';
    const numbers = '23456789';
    const symbols = '!@#$%&*';
    const all = upper + lower + numbers + symbols;

    const pick = (chars) => chars[Math.floor(Math.random() * chars.length)];

    const required = [pick(upper), pick(lower), pick(numbers), pick(symbols)];
    const rest = Array.from({ length: length - required.length }, () => pick(all));

    return [...required, ...rest]
        .sort(() => Math.random() - 0.5)
        .join('');
};
