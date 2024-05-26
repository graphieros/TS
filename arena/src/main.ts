import "./style.css"
import { Sparkline } from "../node_modules/turbo-spark/dist/turbo-spark"

const app = document.getElementById('app');

// const dataset = [1, 2, 3, 4]
const dataset = [
  { name: "Serie 1", values: [12, 3, 6, -8, 3, 14, 12, 16]},
  { name: "Serie 2", values: [3, 7, 2, 1, 6, 9, 13, 21]},
  { name: "Serie 3", values: [21, 32, 43, 23, 21, 22, 11, 16]},
]

const config = {
  line_smooth: true,
  label_axis_x_values: ['JAN', 'FEV', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP']
}

const sparkline = Sparkline({
  container: app,
  dataset,
  config
})

function incrementDataset() {
  sparkline.dataset.push({ name: 'Serie 3', values: [1, 2, 3, 4, 5, 6]})
}

function changeConfig() {
  sparkline.config.line_smooth = !sparkline.config.line_smooth
}

const buttonDataset = document.getElementById('addDataset')
buttonDataset?.addEventListener('click', incrementDataset)

const buttonConfig = document.getElementById('changeConfig')
buttonConfig?.addEventListener('click', changeConfig)


