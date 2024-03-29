import { format, addDays, differenceInDays } from 'date-fns'

export const today = new Date();
export const this_year = today.getFullYear();
export const this_month = today.getMonth() + 1;
export const this_date = today.getDate();
export const this_day = today.getDay();


export const zeroPadding = (num: number, len: number) => {
    return (Array(num).join('0') + num).slice(-len);
}

export const getTimes = (_date: Date, verbose: number) => {
    var times = []
    var formats = "yyyy/MM/dd HH:mm"
    if (verbose === 1) formats = "HH:mm"

    const year = _date.getFullYear();
    const month = _date.getMonth();
    const date = _date.getDate();

    for (var i = Number(process.env.REACT_APP_CALENDER_TIME_FROM); i < Number(process.env.REACT_APP_CALENDER_TIME_TO); i++) {
        times.push(format(new Date(year, month, date, i, 0), formats));
        times.push(format(new Date(year, month, date, i, 30), formats));
    }
    return times
}

export const getDates = (date_start: Date, verbose: number) => {
    var dates = []
    var formats = "yyyy/MM/dd"
    if (verbose === 1) formats = "MM/dd"
    else if (verbose === 2) formats = "yyyyMMdd"

    for (var i = 0; i < 7; i++) {
        dates.push(format(addDays(date_start, i), formats));
    }
    return dates
}

export const getDateTimeString = (date: Date) => {
    const convertedDate = format(date, 'yyyyddMM')
    const convertedTime = format(date, 'HHmm')

    return { date: convertedDate, time: convertedTime }
}

export const getDateRangeString = (dateFrom: Date, dateTo: Date) => {
    var dates = []
    var formats = "yyyyMMdd"
    const diff = differenceInDays(dateFrom, dateTo)

    for (var i = 0; i < diff; i++) {
        dates.push(format(addDays(dateFrom, i), formats));
    }

    return dates
}

export const dateToDateString = (date: string, verbose: number) => {
    var formats = "yyyyMMdd"
    if (verbose === 1) formats = "HHmm"
    else if (verbose === 2) formats = "MM/dd"
    return format(new Date(date), formats)
}