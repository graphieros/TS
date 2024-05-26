import { LineConfig, LineDataset, Shape } from "../../types/main";
import { config_sparkline } from "../configs/sparkline";
import { CONSTANT } from "../utils/constants";
import { convertColorToHex, createProxyObservable, createShape, createSmoothPath, palette, useNestedProp } from "../utils/main";
import * as detector from "../utils/chartDetector"

export default function Sparkline({
    container,
    config = null,
    dataset
}: {
    container: HTMLElement;
    config?: LineConfig;
    dataset: LineDataset;
}) {

    const SVG = document.createElementNS(CONSTANT.XMLNS, "svg");
    let init = true;
    
    function resetChart() {
        SVG.innerHTML = "";
        makeChart();
    }

    let finalConfig = useNestedProp({
        defaultConfig: config_sparkline,
        userConfig: config ?? {}
    })
    
    function makeChart() {

        const viewBox = `0 0 ${finalConfig.chart_width} ${finalConfig.chart_height}`
        SVG.setAttribute('viewBox', viewBox)
        SVG.style.backgroundColor = finalConfig.color_background;

        // DRAWING AREA
        const drawingArea = {
            left: finalConfig.chart_padding_left,
            top: finalConfig.chart_padding_top,
            right: finalConfig.chart_width - finalConfig.chart_padding_right,
            bottom: finalConfig.chart_height - finalConfig.chart_padding_bottom,
            width: finalConfig.chart_width - finalConfig.chart_padding_left - finalConfig.chart_padding_right,
            height: finalConfig.chart_height - finalConfig.chart_padding_top - finalConfig.chart_padding_bottom
        }

        const finalDataset = detector.detectChart(dataset)
        const slot = drawingArea.width / finalDataset.maxSeriesLength;

        let mutableDataset:any = [];

        if (detector.isSimpleArrayOfNumbers(finalDataset.usableDataset)) {
            //
        } else {
            mutableDataset = finalDataset.usableDataset.map((ds: any, k: number) => {
                const plots = ds.VALUES.map((v: number, i: number) => {
                    return {
                        x: drawingArea.left + (i * slot) + (slot / 2),
                        y: drawingArea.bottom - (((v + Math.abs(finalDataset.min)) / (finalDataset.max + Math.abs(finalDataset.min))) * drawingArea.height)
                    }
                });

                return {
                    ...ds,
                    plots,
                    path: finalConfig.line_smooth ? createSmoothPath(plots) : plots.map((p:any) => `${p.x},${p.y} `).toString().trim(),
                    color: ds.color ? convertColorToHex(ds.color) : palette[k] || palette[k % palette.length]
                }
            })
        }

        console.log({ mutableDataset, slot })

        // GRID

        if (finalConfig.grid_axis_y_show) {
            createShape({
                shape: Shape.LINE,
                config: {
                    x1: finalConfig.chart_padding_left,
                    x2: finalConfig.chart_padding_left,
                    y1: finalConfig.chart_padding_top,
                    y2: finalConfig.chart_height - finalConfig.chart_padding_bottom,
                    stroke: finalConfig.grid_axis_stroke,
                    'stroke-width': finalConfig.grid_axis_stroke_width,
                    'stroke-linecap': 'round'
                },
                parent: SVG
            })
        }

        // PLOTS

        mutableDataset.forEach((ds: any) => {
            createShape({
                shape: Shape.PATH,
                config: {
                    d: `M${ds.path}`,
                    stroke: ds.color,
                    'stroke-width': 1,
                    fill: 'none'
                },
                parent: SVG
            });

            ds.plots.forEach((plot: any) => {
                createShape({
                    shape: Shape.CIRCLE,
                    config: {
                        cx: plot.x,
                        cy: plot.y,
                        r: 3,
                        fill: ds.color
                    },
                    parent: SVG
                })
            })
        })

        if(init) {
            container.appendChild(SVG);
            init = false;
        }
    }
    makeChart();
    
    const observedDataset = createProxyObservable(dataset, resetChart);
    const observedConfig = createProxyObservable(finalConfig, resetChart);
    

    return {
        dataset: observedDataset,
        config: observedConfig
    };
}
