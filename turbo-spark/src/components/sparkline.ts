import { LineConfig, LineDataset, Shape } from "../../types/main";
import { config_sparkline } from "../configs/sparkline";
import { CONSTANT } from "../utils/constants";
import { calculateNiceScale, convertColorToHex, createProxyObservable, createShape, createSmoothPath, dataLabel, palette, useNestedProp } from "../utils/main";
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
        SVG.style.backgroundColor = finalConfig.chart_background;
        SVG.style.width = "100%";

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
        const scale = calculateNiceScale(finalDataset.min < 0 ? finalDataset.min : 0, finalDataset.max, finalConfig.grid_axis_y_scale_ticks); // CONFIG

        let mutableDataset:any = [];

        if (detector.isSimpleArrayOfNumbers(finalDataset.usableDataset)) {
            //
        } else {
            mutableDataset = finalDataset.usableDataset.map((ds: any, k: number) => {
                const plots = ds.VALUES.map((v: number, i: number) => {
                    return {
                        x: drawingArea.left + (i * slot) + (slot / 2),
                        y: drawingArea.bottom - (((v + Math.abs(scale.min)) / (scale.max + Math.abs(scale.min))) * drawingArea.height)
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

        const zeroPosition = drawingArea.bottom - ((Math.abs(scale.min) / (scale.max + Math.abs(scale.min))) * drawingArea.height);

        console.log({scale})

        // GRID >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> GRID //

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

        if (finalConfig.grid_axis_x_show) {
            createShape({
                shape: Shape.LINE,
                config: {
                    x1: drawingArea.left,
                    x2: drawingArea.right,
                    y1: zeroPosition,
                    y2: zeroPosition,
                    stroke: finalConfig.grid_axis_stroke,
                    'stroke-width': finalConfig.grid_axis_stroke_width,
                    'stroke-linecap': 'round'
                },
                parent: SVG
            })
        }

        if (finalConfig.grid_lines_y_show) {
            for (let i = 1; i < finalDataset.maxSeriesLength + 1; i += 1) {
                createShape({
                    shape: Shape.LINE,
                    config: {
                        x1: drawingArea.left + (slot * i),
                        x2: drawingArea.left + (slot * i),
                        y1: drawingArea.top,
                        y2: drawingArea.bottom,
                        stroke: finalConfig.grid_lines_y_stroke,
                        'stroke-width': finalConfig.grid_lines_y_stroke_width,
                        'stroke-linecap': 'round',
                        'stroke-dasharray': finalConfig.grid_lines_y_stroke_dasharray
                    },
                    parent: SVG
                })
            }
        }

        if (finalConfig.label_axis_x_show && finalConfig.label_axis_x_values.length) {
            for (let i = 0; i < finalDataset.maxSeriesLength; i += 1) {
                const label = createShape({
                    shape: Shape.TEXT,
                    config: {
                        x: drawingArea.left + (slot * i) + (slot / 2) + finalConfig.label_axis_x_offset_x,
                        y: drawingArea.bottom + (finalConfig.label_axis_x_font_size * 1.5) + finalConfig.label_axis_x_offset_y,
                        fill: finalConfig.label_axis_x_color,
                        'font-size': finalConfig.label_axis_x_font_size,
                        'font-weight': finalConfig.label_axis_x_bold ? 'bold' : 'normal',
                        'text-anchor': 'middle'
                    },
                    parent: SVG
                })
                label.innerHTML = finalConfig.label_axis_x_values[i]
            }
        }

        if (finalConfig.label_axis_y_show) {
            scale.ticks.forEach((tick: number, i: number) => {
                const y = drawingArea.bottom - (i * (drawingArea.height / (scale.ticks.length - 1)));
                const label = createShape({
                    shape: Shape.TEXT,
                    config: {
                        x: drawingArea.left + finalConfig.label_axis_y_offset_x - 6,
                        y,
                        'font-size': finalConfig.label_axis_y_font_size,
                        'font-weight': finalConfig.label_axis_y_bold ? 'bold' : 'normal',
                        fill: finalConfig.label_axis_y_color,
                        'text-anchor': 'end'
                    },
                    parent: SVG
                })
                label.innerHTML = dataLabel({
                    p: finalConfig.label_prefix,
                    v: tick,
                    s: finalConfig.label_suffix,
                    r: finalConfig.label_axis_y_rounding
                });

                if (finalConfig.grid_lines_x_show) {
                    createShape({
                        shape: Shape.LINE,
                        config: {
                            x1: drawingArea.left,
                            x2: drawingArea.right,
                            y1: y,
                            y2: y,
                            stroke: finalConfig.grid_lines_x_stroke,
                            'stroke-width': finalConfig.grid_lines_x_stroke_width,
                            'stroke-linecap': 'round',
                            'stroke-dasharray': finalConfig.grid_lines_x_stroke_dasharray
                        },
                        parent: SVG
                    })
                }
            })
        }

        // GRID <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< GRID //

        // PLOTS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> PLOTS //

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
                        r: finalConfig.plot_radius,
                        fill: ds.color,
                        stroke: finalConfig.plot_stroke,
                        'stroke-width': finalConfig.plot_stroke_width
                    },
                    parent: SVG
                })
            })
        })

        // PLOTS <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< PLOTS //

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
