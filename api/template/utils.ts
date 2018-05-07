const count_c = (s: string, c: string): number => {
    let count = 0;
    for (const char of s)
        count += +(char === c);
    return count;
};

export const isISODateString = (s: string): boolean =>
    s && s.length === 24 && count_c(s, ':') === 2 && count_c(s, '-') === 2 && count_c(s, '.') === 1;
