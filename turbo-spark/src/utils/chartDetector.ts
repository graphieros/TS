export const nameType = ['NAME', 'TITLE', 'DESCRIPTION', 'LABEL'];
export const dataType = ['SERIE', 'SERIES', 'DATA', 'VALUE', 'VALUES', 'NUM'];
export const timeType = ['TIME', 'PERIOD', 'MONTH', 'YEAR', 'MONTHS', 'YEARS', 'DAY', 'DAYS', 'HOUR', 'HOURS']

export function detectChart(dataset: any) : { dataset: any; maxSeriesLength: number; usableDataset: any, min: number; max: number}{
    let usableDataset = null;
    let maxSeriesLength = 0;

    const isJustANumber = typeof dataset === 'number';
    const isJustAString = typeof dataset === 'string';

    let min = 0;
    let max = 0;

    if (isJustANumber || isJustAString) {
        console.warn(`The provided dataset (${dataset}) is not sufficient to build a chart`);
    }
    
    if (isSimpleArray(dataset)) {

        if (isSimpleArrayOfNumbers(dataset)) {
            usableDataset = dataset;
            maxSeriesLength = dataset.length;
            min = Math.min(...dataset);
            max = Math.max(...dataset);
        }

        if (isSimpleArrayOfObjects(dataset)) {
            // if (!isArrayOfObjectsOfSameDataType(dataset)) {
            //     throw new Error('The objects in the dataset array have a different data structure. Either keys or value types are different.')
            // }
            const keys = Object.keys(dataset[0]);
            const values = Object.values(dataset[0]);
            if (!keys.some(key => hasValidDataTypeKey(key))) {
                throw new Error('The data type of the dataset objects in the array must contain one of the following keys: DATA, SERIES, VALUE, VALUES, NUM. Casing is not important.')
            }

            if (passesDatatypeCheck(values, (v: any) => {
                return Array.isArray(v) && isSimpleArrayOfNumbers(v)
            })) {

                maxSeriesLength = maxLengthOfArrayTypesInArrayOfObjects(dataset);
                usableDataset = dataset.map((d: any) => {
                    return {
                        ...d,
                        data: getFirstEntryMatch(d, (v: any) => isSimpleArrayOfNumbers(v))
                    }
                })
            }
            dataset = dataset.map((d: any) => uppercaseKeys(d))
            usableDataset = usableDataset.map((d: any) => uppercaseKeys(d))
            max = Math.max(...usableDataset.flatMap((d:any) => d.VALUES))
            min = Math.min(...usableDataset.flatMap((d:any) => d.VALUES)) > 0 ? 0 : Math.min(...usableDataset.flatMap((d:any) => d.VALUES))
        }
    }

    return {
        min,
        max,
        dataset,
        usableDataset,
        maxSeriesLength
    }
}

export function isEmptyDataset(d: any) {
    return !d || (isSimpleArray(d) && !d.length);
}

export function isSimpleArray(d: any) {
    return Array.isArray(d);
}

export function isEmptyObject(d: any) {
    return !isSimpleArray(d) && typeof d === 'object' && Object.keys(d).length > 0;
}

export function isSimpleArrayOfNumbers(d: any) {
    if (!isSimpleArray(d) || isEmptyDataset(d)) return false;
    const converted = d.map((v: any) => Number(v));
    return ![...new Set(converted.flatMap((d: any) => typeof d === 'number' && !isNaN(d)))].includes(false);
}

export function isSimpleArrayOfStrings(d: any) {
    if (!isSimpleArray(d) || isEmptyDataset(d)) return false;
    return ![...new Set(d.flatMap((d: any) => typeof d === 'string'))].includes(false);
}

export function isSimpleArrayOfObjects(d: any) {
    if (!isSimpleArray(d) || isEmptyDataset(d)) return false;
    const isArrayOfObjects = ![...new Set(d.flatMap((v: any) => typeof v === 'object' && !Array.isArray(v)))].includes(false);
    if(!isArrayOfObjects) return false;
    return !d.map((v: any) => Object.keys(v).length > 0).includes(false)
}

export function haveSameStructure(obj1: any, obj2: any) {
    const keys1 = Object.keys(obj1).sort();
    const keys2 = Object.keys(obj2).sort();
    if (keys1.length !== keys2.length) {
        return false;
    }
    for (let i = 0; i < keys1.length; i += 1) {
        const key1 = keys1[i];
        const key2 = keys2[i];

        if (key1 !== key2 || typeof obj1[key1] !== typeof obj2[key2]) {
            return false;
        }
    }
    return true;
}

export function isArrayOfObjectsOfSameDataType(d: any) {
    if (d.length <= 1) return true;
    for (let i = 0; i < d.length; i += 1) {
        for (let j = i + 1; j < d.length; j += 1) {
            if (!haveSameStructure(d[i], d[j])) {
                return false;
            }
        }
    }
    return true;
}

export function hasValidDataTypeKey(key: any) {
    return dataType.includes(key.toUpperCase())
}

export function passesDatatypeCheck(datapoints: any, checkTypeFunction: any) {
    let arr = [];

    for (let i = 0; i < datapoints.length; i += 1) {
        arr.push(checkTypeFunction(datapoints[i]))
    }
    return arr.includes(true);
}

export function maxLengthOfArrayTypesInArrayOfObjects(ds: any) {
    return Math.max(...[...ds].flatMap(d => {
        return Object.values(d).filter(d => isSimpleArrayOfNumbers(d)).map((d: any) => d.length)
    }))
}

export function getFirstEntryMatch(datapoint: any, matchFunction: any) {
    return Object.values(datapoint).filter(d => matchFunction(d))[0]
}

export function uppercaseKeys(obj: any) {
    const newObj: any = {};
    const exclusionList = [
        'name',
        'datapoint_height_ratio',
        'datapoint_scale_ticks',
        'datapoint_line_smooth'
    ]
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (!exclusionList.includes(key)) {
                newObj[key.toUpperCase()] = obj[key];
            } else {
                newObj[key] = obj[key]
            }
        }
    }
    return newObj;
}

const chartDetector = {
    dataType,
    detectChart,
    getFirstEntryMatch,
    hasValidDataTypeKey,
    isArrayOfObjectsOfSameDataType,
    isEmptyDataset,
    isEmptyObject,
    isSimpleArray,
    isSimpleArrayOfNumbers,
    isSimpleArrayOfObjects,
    isSimpleArrayOfStrings,
    maxLengthOfArrayTypesInArrayOfObjects,
    nameType,
    passesDatatypeCheck,
    timeType,
    uppercaseKeys,
}

export default chartDetector;