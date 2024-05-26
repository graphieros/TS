export type LineConfig = {
    axis_x_show?: boolean
    axis_y_show?: boolean
    color_background?: string
    grid_x_show?: boolean
    grid_y_show?: boolean
    grid_stroke_width?: number;
} | null | undefined

export type LineDataset = number[] | NameValue[] | NameValues[]

export type Line = {
    config: LineConfig 
    dataset: LineDataset
}

export type NameValue = {
    name: string
    value: number
}

export type NameValues = {
    name: string
    values: number[]
}

export enum Shape {
    CIRCLE = "circle",
    RECT = "rect",
    LINE = "line",
    TEXT = "text",
    POLYGON = "polygon",
    PATH = "path"
}

export type ShapeConfig = {
    cx?: number
    cy?: number
    points?: string
    r?: number
    stroke?: string
    'stroke-linecap'?: 'round' | 'square' | 'butt'
    'stroke-linejoin'?: 'round' | 'miter'
    'stroke-width'?: string | number
    'stroke-dasharray'?: string | number
    'text-anchor'?: 'end' | 'start' | 'middle'
    'font-weight'?: 'bold' | 'normal'
    'font-size'?: number | string
    x1?: number
    x2?: number
    x?: number
    y1?: number
    y2?: number
    y?: number
    fill?: string
    d?: string
}