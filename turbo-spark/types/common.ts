export type ChartLegend = {
    legend_show?: boolean
    legend_background?: string
    legend_color?: string
    legend_font_size?: number
    legend_marker_size?: number
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
    tooltip_marker_size?: number
}

export type TextAlign = "left" | "center" | "right"

export type ChartTitle = {
    title_show?: boolean;
    title_background?: string;
    title_align?: TextAlign
    title_text?: string
    title_color?: string
    title_font_size?: number
    title_bold?: boolean
    subtitle_text?: string
    subtitle_color?: string
    subtitle_font_size?: number
    subtitle_bold?: boolean
}

export type ChartTable = {
    table_details_title?: string
    table_background?: string
    table_color?: string
    table_show?: boolean
    table_caption?: string
    table_font_size?: number
}