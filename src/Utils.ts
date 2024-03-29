export function dumpBin(bin: number, len: number)
{
    console.log(binToString(bin,len))
}

export function binToString(bin: number, len: number)
{
    return bin.toString(2).padStart(len,'0')
}
