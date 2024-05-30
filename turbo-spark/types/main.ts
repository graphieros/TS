export type UnknownObject = {
    [key: string]: any
}

export type ProxyHandler = {
    set(target: {
        [x: string]: any;
    }, property: string | number, newValue: any): boolean;
}

export type LineConfig = {
    // CHART SETTINGS
    chart_height?: number
    chart_width?: number
    chart_padding_top?: number
    chart_padding_right?: number
    chart_padding_bottom?: number
    chart_padding_left?: number
    chart_background?: string

    // GRID SETTINGS
    grid_axis_stroke?: string
    grid_axis_stroke_width?: number
    grid_axis_x_show?: boolean
    grid_axis_y_show?: boolean
    grid_axis_y_scale_ticks?: number
    grid_lines_y_show?: boolean
    grid_lines_y_stroke?: string
    grid_lines_y_stroke_width?: number
    grid_lines_y_stroke_dasharray?: number
    grid_lines_x_show?: boolean
    grid_lines_x_stroke?: string
    grid_lines_x_stroke_width?: number
    grid_lines_x_stroke_dasharray?: number

    // LABEL SETTINGS
    label_axis_y_bold?: boolean
    label_axis_y_color?: string
    label_axis_y_font_size?: number
    label_axis_y_rounding?: number
    label_axis_y_show?: boolean
    label_axis_y_offset_x?: number
    label_axis_y_offset_y?: number
    label_prefix?: string
    label_suffix?: string
    label_axis_x_values?: string[]
    label_axis_x_bold?: boolean
    label_axis_x_color?: string,
    label_axis_x_font_size?: number
    label_axis_x_rounding?: number
    label_axis_x_show?: boolean
    label_axis_x_offset_x?: number
    label_axis_x_offset_y?: number

    // LINE SETTINGS
    line_smooth?: boolean

    // PLOT SETTINGS
    plot_radius?: number
    plot_stroke?: string
    plot_stroke_width?: number
    plot_focus_radius?: number

    // SELECTOR
    selector_show?: boolean
    selector_stroke?: string
    selector_stroke_width?: number
    selector_stroke_dasharray?: number

}

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
    height?: number | string
    width?: number | string
    x1?: number
    x2?: number
    x?: number
    y1?: number
    y2?: number
    y?: number
    fill?: string
    d?: string
}

export type Coordinate = {
    x: number
    y: number
    absoluteIndex?: number
}

export type LineMutableDataset = {
    plots: Coordinate[]
    path: string
    color: string
    id?: string
}

export type Scale = {
    min: number
    max: number
    tickSize: number
    ticks: number[]
}

export type LinePlotCircle = {
    element: SVGCircleElement
    plot: Coordinate
}

export type STACK_LINE = {
    plots: LinePlotCircle[]
    selectors: SVGLineElement[]
}