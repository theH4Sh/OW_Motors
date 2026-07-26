export function orderMatchesSearch(order, query, {
    includeProcessedBy = false,
    includeBranch = false,
} = {}) {
    const q = query.trim().toLowerCase();
    if (!q) return true;

    const amountRaw = String(order.totalAmount ?? '');
    const amountFormatted = Number(order.totalAmount || 0).toLocaleString().toLowerCase();
    const amountQuery = q.replace(/,/g, '').replace(/\bpkr\b/g, '').trim();

    const date = new Date(order.createdAt);
    const dateCandidates = Number.isNaN(date.getTime())
        ? []
        : [
            date.toLocaleDateString(),
            date.toLocaleDateString('en-GB'),
            date.toLocaleDateString('en-US'),
            date.toISOString().slice(0, 10),
            date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            date.toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        ].map((value) => value.toLowerCase());

    const productMatch = (order.items || []).some((item) => {
        const productName = item.product?.name || '';
        return productName.toLowerCase().includes(q);
    });

    return (
        order.name?.toLowerCase().includes(q) ||
        order.fatherName?.toLowerCase().includes(q) ||
        order.phone?.toLowerCase().includes(q) ||
        order.cnic?.toLowerCase().includes(q) ||
        order._id?.toLowerCase().includes(q) ||
        amountRaw.includes(amountQuery) ||
        amountFormatted.includes(q) ||
        dateCandidates.some((value) => value.includes(q)) ||
        productMatch ||
        (includeProcessedBy && order.processedBy?.toLowerCase().includes(q)) ||
        (includeBranch && order.branch?.toLowerCase().includes(q))
    );
}
