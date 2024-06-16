import "./style.css"
import { XY, type ConfigXY, type ChartXY } from "../node_modules/turbo-spark/dist/turbo-spark.js"
const app = document.getElementById('container');

// const dataset = [1, 2, 3, 4]
const dataset = [
  { type: "bar", name: "Serie 1", values: [1, -2, 5, 8], datapoint_height_ratio: 0.6, datapoint_scale_ticks: 3 },
  { type: "bar", name: "Serie 2", values: [2, 3, -6, 9], datapoint_scale_ticks: 2, datapoint_line_smooth: false, datapoint_datalabel_show: true },
  { type: "line", name: "Serie 3", values: [3, -4, 7, 20], datapoint_scale_ticks: 2, datapoint_line_smooth: false, datapoint_datalabel_show: true },
]

const datasetSimple = [10, 20, 12, 34, 13, 22, 6, 13, 25];

const config: ConfigXY = {
  line_smooth: true,
  line_smooth_force: 0.15,
  tooltip_show: true,
  series_stacked: false,
  grid_axis_y_name: 'Strength',
  grid_axis_x_name: 'Time flies',
  label_axis_x_values: ['JAN', 'FEV', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP'],
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

const buttonDataset = document.getElementById('addDataset')
buttonDataset?.addEventListener('click', incrementDataset)

const buttonConfig = document.getElementById('changeConfig')
buttonConfig?.addEventListener('click', changeConfig)


