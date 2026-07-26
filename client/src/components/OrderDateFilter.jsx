import React, { useEffect, useRef, useState } from 'react';
import { DATE_PRESETS, MONTH_OPTIONS, formatCustomLabel } from '../utils/orderDateFilter';

const OrderDateFilter = ({
    period,
    month,
    year,
    years,
    onPeriodChange,
    onMonthChange,
    onYearChange,
}) => {
    const isCustom = period === 'custom';
    const [isOpen, setIsOpen] = useState(false);
    const wrapRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleCustomClick = () => {
        if (!isCustom) onPeriodChange('custom');
        setIsOpen((prev) => (isCustom ? !prev : true));
    };

    return (
        <div className="filter-buttons">
            {DATE_PRESETS.map((preset) => (
                <button
                    key={preset.value}
                    type="button"
                    onClick={() => {
                        onPeriodChange(preset.value);
                        setIsOpen(false);
                    }}
                    className={`btn ${period === preset.value ? 'btn-primary' : 'btn-secondary'}`}
                >
                    {preset.label}
                </button>
            ))}

            <div className="date-picker-anchor" ref={wrapRef}>
                <button
                    type="button"
                    onClick={handleCustomClick}
                    className={`btn date-picker-trigger ${isCustom ? 'btn-primary' : 'btn-secondary'}`}
                >
                    <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {isCustom ? formatCustomLabel({ month, year }) : 'Custom'}
                    <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" className="date-picker-caret">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {isOpen && (
                    <div className="date-picker-popover" role="dialog" aria-label="Choose month and year">
                        <div className="date-picker-field">
                            <label>Month</label>
                            <select
                                value={month}
                                onChange={(e) => onMonthChange(e.target.value === 'any' ? 'any' : Number(e.target.value))}
                            >
                                <option value="any">Whole year</option>
                                {MONTH_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="date-picker-field">
                            <label>Year</label>
                            <select
                                value={year}
                                onChange={(e) => onYearChange(Number(e.target.value))}
                            >
                                {years.map((optionYear) => (
                                    <option key={optionYear} value={optionYear}>
                                        {optionYear}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="button"
                            className="btn btn-primary date-picker-done"
                            onClick={() => setIsOpen(false)}
                        >
                            Done
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderDateFilter;
