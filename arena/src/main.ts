import "./style.css"
import { XY, type ConfigXY, type ChartXY } from "../node_modules/turbo-spark/dist/turbo-spark.js"
const app = document.getElementById('container');

// const dataset = [1, 2, 3, 4]
const dataset = [
  {
    type: "bar",
    name: "Serie 0",
    values: [-340, null, -130, -80, -50, -30, -20, -10, 0, 10, 20, 30, 50, 80, 130, 210, 340],
    datapoint_height_ratio: 0.4,
    datapoint_scale_ticks: 3,
    datapoint_line_show_area: true,
    datapoint_line_smooth: true,
  },
  {
    type: "line",
    name: "Serie 1",
    values: [34, null, 13, 8, 5, 3, 2, 1, 0, -1, -2, -3, -5, -8, -13, -21, -34],
    datapoint_scale_ticks: 3,
    datapoint_height_ratio: 0.4,
    datapoint_line_show_area: true,
    datapoint_line_smooth: true,
  },
  {
    type: "line",
    name: "Serie 2",
    values: [0, 1, 1, 1, 0, 0, 1, 1, 1, 0],
    datapoint_scale_ticks: 2,
    datapoint_line_smooth: false,
    datapoint_datalabel_show: true,
    datapoint_line_show_area: true
  },
  {
    type: "line",
    name: "Serie 3",
    values: [1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
    datapoint_scale_ticks: 2,
    datapoint_line_smooth: false,
    datapoint_datalabel_show: true,
    datapoint_line_show_area: true
  },
]

const datasetSimple = [10, 20, 12, 34, 13, 22, 6, 13, 25];

const config: ConfigXY = {
  line_smooth: true,
  line_smooth_force: 0.15,
  tooltip_show: true,
  series_stacked: true,
  // series_stack_gap: 10,
  grid_axis_y_name: 'Strength',
  grid_axis_x_name: 'Time flies',
  grid_lines_y_stroke_opacity: 0.1,
  title_text: 'Title',
  subtitle_text: 'Subtitle',
  title_align: 'center',
  plot_radius: 2,
  plot_focus_radius: 3,
  table_show: true,
  table_caption: "Table caption",
  table_font_size: 14,
  table_details_title: "Data table",
  // label_axis_x_rotation: -30,
  // chart_custom_palette: ['red', 'green', 'blue', 'orange']
  label_axis_x_values: ['JAN', 'FEV', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC', 'JAN', 'FEB', 'MAR', 'APR', 'MAY'],
  // tooltip_custom: ({ index, series, period} : {index: number, series: any, period: string}) => {
  //     console.log(index, series, period)
  //     return String(period)
  // }
}

const chart: ChartXY = XY({
  container: app,
  dataset,
  config
});

// XY({
//   container: app,
//   dataset: datasetSimple,
//   config
// })

function incrementDataset() {
  chart.dataset.push({ name: 'Serie 3', values: [0, 1, 1, 1, 0, 0, 0, 0, 1, 1], datapoint_line_smooth: false, datapoint_scale_ticks: 2, datapoint_datalabel_show: false })
}

function changeConfig() {
  chart.config.line_smooth = !chart.config.line_smooth
  chart.config.chart_background = `rgb(${Math.round(Math.random() * 255)},${Math.round(Math.random() * 255)},${Math.round(Math.random() * 255)})`
}

function toggleStack() {
  chart.config.series_stacked = !chart.config.series_stacked;
}

function toggleTable() {
  chart.config.table_show = !chart.config.table_show;
}

const buttonDataset = document.getElementById('addDataset')
buttonDataset?.addEventListener('click', incrementDataset)

const buttonConfig = document.getElementById('changeConfig')
buttonConfig?.addEventListener('click', changeConfig)

const buttonStack = document.getElementById('changeStack');
buttonStack?.addEventListener('click', toggleStack)

const buttonTable = document.getElementById('toggleTable');
buttonTable?.addEventListener('click', toggleTable)


