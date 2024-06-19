import "./style.css"
import { XY, type ConfigXY, type ChartXY } from "../node_modules/turbo-spark/dist/turbo-spark.js"
const app = document.getElementById('container');

// const dataset = [1, 2, 3, 4]

let ds1 = [];
let ds2 = [];
let ds3 = [];
let ds4 = [];
for(let i = 0; i < 12; i += 1) {
  ds1.push(Math.round(Math.random() * 1000));
  ds2.push(Math.round(Math.random() * 100));
  ds3.push(Math.round(Math.random() * 1));
  ds4.push(Math.round(Math.random() * 1));
}

const dataset = [
  {
    type: "line",
    name: "Serie 0",
    values: ds1,
    // datapoint_height_ratio: 0.4,
    datapoint_scale_ticks: 3,
    datapoint_line_show_area: true,
    datapoint_line_smooth: false,
    datapoint_datalabel_show: false
  },
  {
    type: "line",
    name: "Serie 1",
    values: ds2,
    datapoint_scale_ticks: 3,
    // datapoint_height_ratio: 0.4,
    datapoint_line_show_area: true,
    datapoint_line_smooth: false,
    datapoint_datalabel_show: false
  },
  {
    type: "line",
    name: "Serie 2",
    values: ds3,
    datapoint_scale_ticks: 2,
    datapoint_line_smooth: false,
    datapoint_datalabel_show: false,
    datapoint_line_show_area: true
  },
  {
    type: "line",
    name: "Serie 3",
    values: ds4,
    datapoint_scale_ticks: 2,
    datapoint_line_smooth: false,
    datapoint_datalabel_show: false,
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
  plot_radius: 0,
  plot_focus_radius: 3,
  table_show: true,
  table_caption: "Table caption",
  table_font_size: 14,
  label_axis_x_show: false,
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


