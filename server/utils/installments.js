const startOfDay = (date = new Date()) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

const roundMoney = (n) => Math.round(Number(n) * 100) / 100;

const remainingBalance = (order) =>
    Math.max(0, roundMoney((order.totalAmount || 0) - (order.amountPaid || 0)));

const buildFixedInstallments = (remaining, count, startDate = new Date()) => {
    const n = Number(count);
    const base = Math.floor((remaining / n) * 100) / 100;
    const installments = [];
    let allocated = 0;

    for (let i = 0; i < n; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + i + 1);
        dueDate.setHours(0, 0, 0, 0);

        const amountDue = i === n - 1
            ? roundMoney(remaining - allocated)
            : base;

        allocated = roundMoney(allocated + amountDue);

        installments.push({
            dueDate,
            amountDue,
            amountPaid: 0,
            paidAt: null,
            status: 'pending'
        });
    }

    return installments;
};

const refreshInstallmentStatuses = (order) => {
    if (order.installmentType !== 'fixed' || !order.installments?.length) return;

    const today = startOfDay();
    order.installments.forEach((inst) => {
        const due = roundMoney(inst.amountDue);
        const paid = roundMoney(inst.amountPaid || 0);

        if (paid >= due - 0.001) {
            inst.status = 'paid';
            if (!inst.paidAt) inst.paidAt = new Date();
            return;
        }

        if (paid > 0) {
            inst.status = 'partial';
        } else if (startOfDay(inst.dueDate) < today) {
            inst.status = 'overdue';
        } else {
            inst.status = 'pending';
        }
    });
};

const computePaymentStatus = (order) => {
    if (remainingBalance(order) <= 0.001) return 'paid';

    if (order.installmentType === 'fixed' && order.installments?.length) {
        const today = startOfDay();
        const hasOverdue = order.installments.some((inst) => {
            if (inst.status === 'paid') return false;
            return startOfDay(inst.dueDate) < today;
        });
        if (hasOverdue) return 'overdue';
    }

    return 'ongoing';
};

const applyPaymentToFixedInstallments = (order, amount) => {
    let left = roundMoney(amount);

    for (const inst of order.installments) {
        if (left <= 0) break;
        const dueLeft = roundMoney(inst.amountDue - (inst.amountPaid || 0));
        if (dueLeft <= 0) continue;

        const apply = Math.min(left, dueLeft);
        inst.amountPaid = roundMoney((inst.amountPaid || 0) + apply);
        left = roundMoney(left - apply);

        if (inst.amountPaid >= inst.amountDue - 0.001) {
            inst.status = 'paid';
            inst.paidAt = new Date();
        } else {
            inst.status = 'partial';
        }
    }

    refreshInstallmentStatuses(order);
};

module.exports = {
    roundMoney,
    remainingBalance,
    buildFixedInstallments,
    refreshInstallmentStatuses,
    computePaymentStatus,
    applyPaymentToFixedInstallments,
    startOfDay
};
