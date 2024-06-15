export type ChartLegend = {
    legend_show?: boolean
    legend_background?: string
    legend_color?: string
    legend_font_size?: number
}

export type ChartTooltip = {
    tooltip_show?: boolean
    tooltip_value_rounding?: number
    tooltip_background_color?: string
    tooltip_font_size?: number
    tooltip_color?: string
    tooltip_padding?: number
    tooltip_border_radius?: number
    tooltip_border?: string
    tooltip_box_shadow?: string
    tooltip_max_width?: number
    tooltip_custom?: null | Function
}