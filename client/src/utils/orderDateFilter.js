export const DATE_PRESETS = [
    { value: 'all', label: 'All Time' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'this_year', label: 'This Year' },
];

export const MONTH_OPTIONS = [
    { value: 0, label: 'January' },
    { value: 1, label: 'February' },
    { value: 2, label: 'March' },
    { value: 3, label: 'April' },
    { value: 4, label: 'May' },
    { value: 5, label: 'June' },
    { value: 6, label: 'July' },
    { value: 7, label: 'August' },
    { value: 8, label: 'September' },
    { value: 9, label: 'October' },
    { value: 10, label: 'November' },
    { value: 11, label: 'December' },
];

export function getAvailableYears(orders = []) {
    const years = new Set(
        orders
            .map((order) => new Date(order.createdAt).getFullYear())
            .filter((year) => !Number.isNaN(year))
    );
    years.add(new Date().getFullYear());
    return [...years].sort((a, b) => b - a);
}

// month is either a number 0-11, or 'any' to match the whole year
export function orderMatchesDatePeriod(order, { period = 'all', month = 'any', year } = {}) {
    if (period === 'all') return true;

    const date = new Date(order.createdAt);
    if (Number.isNaN(date.getTime())) return false;

    const now = new Date();
    const orderYear = date.getFullYear();
    const orderMonth = date.getMonth();

    if (period === 'this_month') {
        return orderYear === now.getFullYear() && orderMonth === now.getMonth();
    }

    if (period === 'last_month') {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return orderYear === lastMonth.getFullYear() && orderMonth === lastMonth.getMonth();
    }

    if (period === 'this_year') {
        return orderYear === now.getFullYear();
    }

    if (period === 'custom') {
        if (orderYear !== Number(year)) return false;
        if (month === 'any') return true;
        return orderMonth === Number(month);
    }

    return true;
}

export function formatCustomLabel({ month, year }) {
    if (month === 'any') return String(year);
    const monthLabel = MONTH_OPTIONS.find((m) => m.value === Number(month))?.label || '';
    return `${monthLabel} ${year}`;
}
