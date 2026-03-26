import type { imagetransformoptions } from '../types/image.types.js'

const transformImage = (t: imagetransformoptions, url: string) : string => {
    const transformations: Array<string> = []
    if (t.transformations.resize) {
        if (t.transformations.resize?.height == null) transformations.push(`w-${t.transformations.resize.width}`)
        else if (t.transformations.resize?.width == null) transformations.push(`h-${t.transformations.resize.height}`)
        else transformations.push( `h-${t.transformations.resize.height},w-${t.transformations.resize.width}`)
    }
    if(t.transformations.crop){
        if (t.transformations.crop?.height == null) transformations.push(`w-${t.transformations.crop.width}`)  
        else if (t.transformations.crop?.width == null) transformations.push(`h-${t.transformations.crop.height}`)
        else transformations.push( `h-${t.transformations.crop.height},w-${t.transformations.crop.width}`)
        transformations.push(`x-${t.transformations.crop.x},y-${t.transformations.crop.y}`)
    }
    if(t.transformations.rotate) transformations.push(`rt-${t.transformations.rotate}`)
    if(t.transformations.format) transformations.push(`f-${t.transformations.format}`)
    if(t.transformations.filters) {
        if(t.transformations.filters.grayscale) transformations.push(`e-grayscale`)
        else transformations.push(`e-sepia`)
    }
    console.log(transformations.join(','));    
    return `${url}?tr=${transformations.join(',')}`
}
export {
    transformImage
}