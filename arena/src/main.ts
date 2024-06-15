import "./style.css"
import { XY, type ConfigXY, type ChartXY } from "../node_modules/turbo-spark/dist/turbo-spark.js"
const app = document.getElementById('app');

// const dataset = [1, 2, 3, 4]
const dataset = [
  { name: "Serie 1", values: [12, -14, 16], datapoint_height_ratio: 0.8 },
  { name: "Serie 2", values: [0, 1, 0, 0, 1, 0, 0, 1], datapoint_scale_ticks: 2, datapoint_line_smooth: false },
  { name: "Serie 3", values: [0, 1, 1, 0, 0, 1, 1, 0], datapoint_scale_ticks: 2, datapoint_line_smooth: false },
]

const datasetSimple = [10, 20, 12, 34, 13, 22, 6, 13, 25];

const config: ConfigXY = {
  line_smooth: true,
  line_smooth_force: 0.15,
  series_stacked: true,
  grid_axis_y_name: 'Strength',
  grid_axis_x_name: 'Time flies',
  label_axis_x_values: ['JAN', 'FEV', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP'],
  // tooltip_custom: ({ index, series, period} : {index: number, series: any, period: string}) => {
  //     console.log(index, series, period)
  //     return String(period)
  // }
}

const chart:ChartXY = XY({
  container: app,
  dataset,
  config
});

XY({
  container: app,
  dataset: datasetSimple,
  config
})

function incrementDataset() {
  chart.dataset.push({ name: 'Serie 3', values: [1, 2, 3, 4, 5, 6] })
}

function changeConfig() {
  chart.config.line_smooth = !chart.config.line_smooth
}

const buttonDataset = document.getElementById('addDataset')
buttonDataset?.addEventListener('click', incrementDataset)

const buttonConfig = document.getElementById('changeConfig')
buttonConfig?.addEventListener('click', changeConfig)


