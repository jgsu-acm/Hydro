export const STATUS = {
    STATUS_WAITING: 0,
    STATUS_ACCEPTED: 1,
    STATUS_WRONG_ANSWER: 2,
    STATUS_TIME_LIMIT_EXCEEDED: 3,
    STATUS_MEMORY_LIMIT_EXCEEDED: 4,
    STATUS_OUTPUT_LIMIT_EXCEEDED: 5,
    STATUS_RUNTIME_ERROR: 6,
    STATUS_COMPILE_ERROR: 7,
    STATUS_SYSTEM_ERROR: 8,
    STATUS_CANCELED: 9,
    STATUS_ETC: 10,
    STATUS_HACKED: 11,
    STATUS_JUDGING: 20,
    STATUS_COMPILING: 21,
    STATUS_FETCHED: 22,
    STATUS_IGNORED: 30,
    STATUS_FORMAT_ERROR: 31,
};

export const STATUS_TEXTS = {
    [STATUS.STATUS_WAITING]: 'Waiting',
    [STATUS.STATUS_ACCEPTED]: 'Accepted',
    [STATUS.STATUS_WRONG_ANSWER]: 'Wrong Answer',
    [STATUS.STATUS_TIME_LIMIT_EXCEEDED]: 'Time Limit Exceeded',
    [STATUS.STATUS_MEMORY_LIMIT_EXCEEDED]: 'Memory Limit Exceeded',
    [STATUS.STATUS_OUTPUT_LIMIT_EXCEEDED]: 'Output Limit Exceeded',
    [STATUS.STATUS_RUNTIME_ERROR]: 'Runtime Error',
    [STATUS.STATUS_COMPILE_ERROR]: 'Compile Error',
    [STATUS.STATUS_SYSTEM_ERROR]: 'System Error',
    [STATUS.STATUS_CANCELED]: 'Cancelled',
    [STATUS.STATUS_ETC]: 'Unknown Error',
    [STATUS.STATUS_HACKED]: 'Hacked',
    [STATUS.STATUS_JUDGING]: 'Running',
    [STATUS.STATUS_COMPILING]: 'Compiling',
    [STATUS.STATUS_FETCHED]: 'Fetched',
    [STATUS.STATUS_IGNORED]: 'Ignored',
    [STATUS.STATUS_FORMAT_ERROR]: 'Format Error',
};

export const STATUS_SHORT_TEXTS = {
    [STATUS.STATUS_ACCEPTED]: 'AC',
    [STATUS.STATUS_WRONG_ANSWER]: 'WA',
    [STATUS.STATUS_TIME_LIMIT_EXCEEDED]: 'TLE',
    [STATUS.STATUS_MEMORY_LIMIT_EXCEEDED]: 'MLE',
    [STATUS.STATUS_OUTPUT_LIMIT_EXCEEDED]: 'OLE',
    [STATUS.STATUS_RUNTIME_ERROR]: 'RE',
    [STATUS.STATUS_COMPILE_ERROR]: 'CE',
    [STATUS.STATUS_SYSTEM_ERROR]: 'SE',
    [STATUS.STATUS_CANCELED]: 'IGN',
    [STATUS.STATUS_HACKED]: 'HK',
    [STATUS.STATUS_IGNORED]: 'IGN',
    [STATUS.STATUS_FORMAT_ERROR]: 'FE',
};

export const STATUS_CODES = {
    0: 'pending',
    1: 'pass',
    2: 'fail',
    3: 'fail',
    4: 'fail',
    5: 'fail',
    6: 'fail',
    7: 'fail',
    8: 'fail',
    9: 'ignored',
    10: 'fail',
    11: 'fail',
    20: 'progress',
    21: 'progress',
    22: 'progress',
    30: 'ignored',
    31: 'ignored',
};

export function getScoreColor(score: number | string): string {
    return [
        '#ff4f4f',
        '#ff694f',
        '#f8603a',
        '#fc8354',
        '#fa9231',
        '#f7bb3b',
        '#ecdb44',
        '#e2ec52',
        '#b0d628',
        '#93b127',
        '#25ad40',
    ][Math.floor((Number(score) || 0) / 10)];
}

export const USER_GENDER_MALE = 0;
export const USER_GENDER_FEMALE = 1;
export const USER_GENDER_OTHER = 2;
export const USER_GENDERS = [USER_GENDER_MALE, USER_GENDER_FEMALE, USER_GENDER_OTHER];
export const USER_GENDER_RANGE = {
    [USER_GENDER_MALE]: 'Boy ♂',
    [USER_GENDER_FEMALE]: 'Girl ♀',
    [USER_GENDER_OTHER]: 'Other',
};
export const USER_GENDER_ICONS = {
    [USER_GENDER_MALE]: '♂',
    [USER_GENDER_FEMALE]: '♀',
    [USER_GENDER_OTHER]: '?',
};
