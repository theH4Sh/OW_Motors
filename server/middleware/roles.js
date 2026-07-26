const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Access denied. Admin role required.',
            error: 'Access denied. Admin role required.',
        });
    }
};

const isManager = (req, res, next) => {
    if (req.user && (req.user.role === 'manager' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Access denied. Manager role required.',
            error: 'Access denied. Manager role required.',
        });
    }
};

module.exports = { isAdmin, isManager };
