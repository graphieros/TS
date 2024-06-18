import { ConfigXY } from "../../types/main";

export const config_sparkline: ConfigXY = {
    // CHART SETTINGS
    chart_height: 309,
    chart_width: 500,
    chart_padding_top: 24,
    chart_padding_left: 48,
    chart_padding_right: 12,
    chart_padding_bottom: 48,
    chart_background: "#FFFFFF",
    chart_area_background_show: true,
    chart_area_background: "#1A1A1A",
    chart_area_background_opacity: 0.01,
    chart_custom_palette: [],

    // GRID SETTINGS
    grid_axis_x_name: '',
    grid_axis_y_name: '',
    grid_axis_y_name_offset_x: -30,
    grid_axis_x_name_offset_y: 40,
    grid_axis_names_font_size: 10,
    grid_axis_names_color: '#1A1A1A',
    grid_axis_stroke: "#CCCCCC",
    grid_axis_stroke_width: 0.5,
    grid_axis_x_show: true,
    grid_axis_y_show: true,
    grid_axis_y_scale_ticks: 5,
    grid_lines_y_show: true,
    grid_lines_y_stroke: "#CCCCCC",
    grid_lines_y_stroke_width: 0.5,
    grid_lines_y_stroke_dasharray: 0,
    grid_lines_x_show: true,
    grid_lines_x_stroke: "#CCCCCC",
    grid_lines_x_stroke_width: 0.5,
    grid_lines_x_stroke_dasharray: 2,
    grid_lines_x_stroke_opacity: 0.5,
    grid_lines_y_stroke_opacity: 0.3,

    // LABEL SETTINGS
    label_axis_y_bold: false,
    label_axis_y_color: '#1A1A1A',
    label_axis_y_font_size: 10,
    label_axis_y_rounding: 1,
    label_axis_y_show: true,
    label_axis_y_offset_x: 0,
    label_axis_y_offset_y: 0,
    label_prefix: '',
    label_suffix: '',
    label_axis_x_values: [],
    label_axis_x_bold: false,
    label_axis_x_color: '#1A1A1A',
    label_axis_x_font_size: 12,
    label_axis_x_rounding: 1,
    label_axis_x_show: true,
    label_axis_x_offset_x: 0,
    label_axis_x_offset_y: 0,
    label_axis_x_rotation: 0,

    // DATA LABEL SETTINGS
    datalabel_show: true,
    datalabel_use_serie_color: true,
    datalabel_default_color: '#1A1A1A',
    datalabel_font_size: 10,
    datalabel_rounding: 1,
    datalabel_offset_y: -6,

    // TOOLTIP SETTINGS
    tooltip_show: true,
    tooltip_value_rounding: 1,
    tooltip_background_color: "#FFFFFF",
    tooltip_font_size: 14,
    tooltip_color: "#1A1A1A",
    tooltip_padding: 12,
    tooltip_border_radius: 4,
    tooltip_border: "1px solid #e1e5e8",
    tooltip_box_shadow: '0 0 12px -6px rgba(0,0,0,0.3)',
    tooltip_max_width: 255,
    tooltip_custom: null,
    tooltip_marker_size: 14,

    // LINE SETTINGS
    line_smooth: false,
    line_smooth_force: 0.15, // between 0 and 0.2
    line_sheathed: true,
    line_stroke_width: 1,
    line_area_opacity: 0.2,

    // PLOT SETTINGS
    plot_radius: 3,
    plot_stroke: "#FFFFFF",
    plot_stroke_width: 1,
    plot_focus_radius: 5,

    // BAR SETTINGS
    bar_border_radius: 2,
    bar_group_gap_proportion: 0.3,
    bar_stroke: '#FFFFFF',
    bar_stroke_width: 0.75,

    // SELECTOR
    selector_show: true,
    selector_stroke: "#CCCCCC",
    selector_stroke_width: 1,
    selector_stroke_dasharray: 2,

    // SERIES SETTINGS
    series_stacked: false,
    series_stack_gap: 20,

    // LEGEND SETTINGS
    legend_show: true,
    legend_background: "#FFFFFF",
    legend_color: "#1A1A1A",
    legend_font_size: 14,
    legend_marker_size: 14,

    // TITLE SETTINGS
    title_show: true,
    title_background: '#FFFFFF',
    title_align: 'center',
    title_text: "",
    title_color: "#1A1A1A",
    title_font_size: 20,
    title_bold: true,
    subtitle_text: "",
    subtitle_color: "#8A8A8A",
    subtitle_font_size: 16,
    subtitle_bold: false,

    // TABLE SETTINGS
    table_details_title: "",
    table_background: '#FFFFFF',
    table_color: '#1A1A1A',
    table_show: false,
    table_caption: "",
    table_font_size: 14,

    // ZOOM SETTINGS
    zoom_background: "#91edc2",
    zoom_stroke: "#3c996d",
    zoom_stroke_width: 2,
    zoom_opacity: 0.2
}