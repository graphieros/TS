import { ChartLegend, ChartTooltip } from "./common";

export type UnknownObject = {
    [key: string]: any
}

export type ProxyHandler = {
    set(target: {
        [x: string]: any;
    }, property: string | number, newValue: any): boolean;
}

export type ConfigXY = ChartLegend & ChartTooltip & {
    // CHART SETTINGS
    chart_height?: number
    chart_width?: number
    chart_padding_top?: number
    chart_padding_right?: number
    chart_padding_bottom?: number
    chart_padding_left?: number
    chart_background?: string
    chart_area_background_show?: boolean
    chart_area_background?: string
    chart_area_background_opacity?: number

    // GRID SETTINGS
    grid_axis_x_name?: string
    grid_axis_x_name_offset_y?: number
    grid_axis_y_name_offset_x?: number
    grid_axis_y_name?: string
    grid_axis_names_font_size?: number
    grid_axis_names_color?: string
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
    grid_lines_x_stroke_opacity?: number

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

    // DATA LABEL SETTINGS
    datalabel_show?: boolean
    datalabel_use_serie_color?: boolean
    datalabel_default_color?: string
    datalabel_font_size?: number
    datalabel_rounding?: number
    datalabel_offset_y?: number

    // TOOLTIP SETTINGS (common ChartTooltip)

    // LINE SETTINGS
    line_smooth?: boolean
    line_smooth_force?: 0 | 0.01 | 0.02 | 0.03 | 0.04 | 0.05 | 0.06 | 0.07 | 0.08 | 0.09 | 0.1 | 0.11 | 0.12 | 0.13 | 0.14 | 0.15 | 0.16 | 0.17 | 0.18 | 0.19 | 0.2

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

    // SERIES SETTINGS
    series_stacked?: boolean
    series_stack_gap?: number

    // LEGEND SETTINGS (common ChartLegend)
}

export type LineDataset = number[] | NameValue[] | SerieXY[]

export type ChartXY = {
    config: ConfigXY
    dataset: LineDataset
}

export type NameValue = {
    name: string
    value: number
}

export type SerieXY = {
    name: string
    VALUES: number[]
    color?: string
    serie_height?: number
    datapoint_height_ratio?: number // 0 to 1
    datapoint_scale_ticks?: number
    datapoint_line_smooth?: boolean
    datapoint_datalabel_show?: boolean
    height_position?: number
    individual_scale?: Scale
    plots: Coordinate[]
    path?: string
    id: string
}

export type TooltipSerieContent = Pick<SerieXY, 'name' | 'color'> & { value: number }

export enum Shape {
    CIRCLE = "circle",
    RECT = "rect",
    LINE = "line",
    TEXT = "text",
    POLYGON = "polygon",
    PATH = "path"
}

export enum Element {
    DIV = 'div',
    SPAN = 'span',
    HR = 'hr',
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

export type MutableDatasetXY = {
    name?: string
    VALUES?: number[]
    plots: Coordinate[]
    path: string
    color: string
    id?: string
    individual_scale?: Scale
    height_position?: number
    serie_height?: number
    datapoint_datalabel_show?: boolean
}

export type Scale = {
    min: number
    max: number
    tickSize: number
    ticks: number[]
}

export type PlotCircle = {
    element: SVGCircleElement
    plot: Coordinate
}

export type STACK_XY = {
    plots: PlotCircle[]
    selectors: SVGLineElement[]
}