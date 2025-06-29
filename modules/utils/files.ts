type FileInfo<T> = {
  value: T;
  file: File;
}

export function getFileInputAs<T>(file: File): Promise<FileInfo<T>> {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject('File not found')
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const json = event.target?.result as string;
            const info = JSON.parse(json);
            resolve({ value: info, file: file });
        };
        reader.readAsText(file );
    })
}

// export const handleLoad = async <T>(elem: HTMLInputElement) => {
//     const tileSetData = await getFileInputAs<T>(elem);
//     return tileSetData
// }  

export async function fetchJson<T>(resource: string): Promise<T> { 
    try {
        const result = await fetch(resource)
        if (!result.ok) throw new Error('Resource not found')
        const data = await result.json()
        return data
    } catch (error) {
        console.error(error)
        throw error
    }
}