import { Coordinate, ConfigXY, LineDataset, Shape, ChartXY, STACK_XY, MutableDatasetXY, SerieXY } from "../../types/main";
import { config_sparkline } from "../configs/xy";
import { CONSTANT } from "../utils/constants";
import { ChartClass, calculateHeightRatioAuto, calculateNiceScale, convertColorToHex, createProxyObservable, createShape, createSmoothPath, createUid, dataLabel, palette, useNestedProp } from "../utils/main";
import * as detector from "../utils/chartDetector"

export default function Sparkline({
    container,
    config = {},
    dataset
}: {
    container: HTMLElement;
    config?: ConfigXY;
    dataset: LineDataset;
}) {

    // IDEAS
    // if a datapoint is null, show exclam icon ?

    const SVG = document.createElementNS(CONSTANT.XMLNS, "svg");
    const SVG_ELEMENTS: STACK_XY = {
        plots: [],
        selectors: []
    }
    let init = true;

    function resetChart() {
        SVG.innerHTML = "";
        SVG_ELEMENTS.plots = [];
        makeChart();
    }

    let finalConfig: ConfigXY = useNestedProp<ConfigXY>({
        defaultConfig: config_sparkline,
        userConfig: config ?? {}
    })

    function hoverDatapoint(index: number) {
        SVG_ELEMENTS.plots.forEach((p) => {
            if (index === p.plot.absoluteIndex) {
                p.element.setAttribute('r', String(finalConfig.plot_focus_radius))
            } else {
                p.element.setAttribute('r', String(finalConfig.plot_radius))
            }
        });
        if (finalConfig.selector_show) {
            SVG_ELEMENTS.selectors.forEach((selector, i: number) => {
                if (index === i) {
                    selector.setAttribute('stroke', String(finalConfig.selector_stroke))
                } else {
                    selector.setAttribute('stroke', 'transparent')
                }
            })
        }
    }

    function resetDatapoints() {
        SVG_ELEMENTS.plots.forEach((p) => {
            p.element.setAttribute('r', String(finalConfig.plot_radius))
        });
        SVG_ELEMENTS.selectors.forEach((s) => {
            s.setAttribute('stroke', 'transparent')
        })
    }

    function makeChart() {

        const viewBox = `0 0 ${finalConfig.chart_width} ${finalConfig.chart_height}`
        SVG.setAttribute('viewBox', viewBox)
        SVG.style.backgroundColor = finalConfig.chart_background!;
        SVG.style.width = "100%";
        SVG.classList.add(ChartClass.XY)

        // DRAWING AREA
        const drawingArea = {
            left: finalConfig.chart_padding_left,
            top: finalConfig.chart_padding_top,
            right: finalConfig.chart_width! - finalConfig.chart_padding_right!,
            bottom: finalConfig.chart_height! - finalConfig.chart_padding_bottom!,
            width: finalConfig.chart_width! - finalConfig.chart_padding_left! - finalConfig.chart_padding_right!,
            height: finalConfig.chart_height! - finalConfig.chart_padding_top! - finalConfig.chart_padding_bottom!
        }

        const finalDataset = detector.detectChart(dataset)
        const slot = drawingArea.width / finalDataset.maxSeriesLength;

        const scale = calculateNiceScale(finalDataset.min < 0 ? finalDataset.min : 0, finalDataset.max, finalConfig.grid_axis_y_scale_ticks!);

        let mutableDataset: MutableDatasetXY[] = [];

        if (detector.isSimpleArrayOfNumbers(finalDataset.usableDataset)) {

            if (finalConfig.series_stacked) {
                console.warn(`\n\nConfig incompatibility:\n\nThe config attribute "series_stacked" must be set to false when using a dataset that is a simple array of numbers.\n\n`)
            }

            const plots = finalDataset.usableDataset.map((ds: number, i: number) => {
                return {
                    x: drawingArea.left! + (i * slot) + (slot / 2),
                    y: drawingArea.bottom! - (((ds + Math.abs(scale.min)) / (scale.max + Math.abs(scale.min))) * drawingArea.height!),
                    absoluteIndex: i
                }
            });
            mutableDataset = [
                {
                    plots,
                    path: finalConfig.line_smooth ? createSmoothPath(plots, finalConfig.line_smooth_force) : plots.map((p: Coordinate) => `${p.x},${p.y} `).toString().trim(),
                    color: palette[0]
                }
            ]
        } else {
            let height_position = 0;
            const multipleScales = finalDataset.usableDataset.map((ds: SerieXY) => {
                const ds_min = Math.min(...ds.VALUES);
                const ds_max = Math.max(...ds.VALUES);
                return calculateNiceScale(ds_min < 0 ? ds_min : 0, ds_max, ds.datapoint_scale_ticks ?? finalConfig.grid_axis_y_scale_ticks!)
            })

            const totalStackGap = finalConfig.series_stacked ? finalConfig.series_stack_gap! * (finalDataset.usableDataset.length - 1) : 0;
            
            mutableDataset = finalDataset.usableDataset.map((ds: SerieXY) => {
                const serie_height = finalConfig.series_stacked 
                ? ds.datapoint_height_ratio
                    ?  (drawingArea.height - totalStackGap) * ds.datapoint_height_ratio
                    :  (drawingArea.height - totalStackGap) * calculateHeightRatioAuto(finalDataset.usableDataset)
                : drawingArea.height;
                return {
                    ...ds,
                    serie_height
                }
            }).map((ds: SerieXY, k: number) => {
                
                let individual_scale = scale;

                if (finalConfig.series_stacked) {
                    individual_scale = multipleScales[k]
                }

                const plots: Coordinate[] = ds.VALUES.map((v: number, i: number) => {
                    
                    return {
                        x: drawingArea.left! + (i * slot) + (slot / 2),
                        y: drawingArea.bottom - height_position - (((v + (Math.abs(individual_scale.min))) / (individual_scale.max + (Math.abs(individual_scale.min)))) * ds.serie_height!) - (k > 0 ? (finalConfig.series_stacked ? finalConfig.series_stack_gap! : 0) : 0),
                        absoluteIndex: i
                    }
                });

                if (finalConfig.series_stacked) {
                    height_position += ds.serie_height! + (k > 0 ? (finalConfig.series_stacked ? finalConfig.series_stack_gap! : 0) : 0);
                }

                return {
                    ...ds,
                    height_position,
                    individual_scale,
                    id: createUid(),
                    plots,
                    path: finalConfig.line_smooth ? createSmoothPath(plots, finalConfig.line_smooth_force) : plots.map(p => `${p.x},${p.y} `).toString().trim(),
                    color: ds.color ? convertColorToHex(ds.color) : palette[k] || palette[k % palette.length]
                }
            })
        }

        const zeroPosition = drawingArea.bottom - ((Math.abs(scale.min) / (scale.max + Math.abs(scale.min))) * drawingArea.height);

        // GRID >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> GRID //

        if (finalConfig.grid_axis_y_show) {
            createShape({
                shape: Shape.LINE,
                config: {
                    x1: finalConfig.chart_padding_left,
                    x2: finalConfig.chart_padding_left,
                    y1: finalConfig.chart_padding_top,
                    y2: finalConfig.chart_height! - finalConfig.chart_padding_bottom!,
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
                        x1: drawingArea.left! + (slot * i),
                        x2: drawingArea.left! + (slot * i),
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

        if (finalConfig.label_axis_x_show && finalConfig.label_axis_x_values!.length) {
            for (let i = 0; i < finalDataset.maxSeriesLength; i += 1) {
                const label = createShape({
                    shape: Shape.TEXT,
                    config: {
                        x: drawingArea.left! + (slot * i) + (slot / 2) + finalConfig.label_axis_x_offset_x!,
                        y: drawingArea.bottom + (finalConfig.label_axis_x_font_size! * 1.5) + finalConfig.label_axis_x_offset_y!,
                        fill: finalConfig.label_axis_x_color,
                        'font-size': finalConfig.label_axis_x_font_size,
                        'font-weight': finalConfig.label_axis_x_bold ? 'bold' : 'normal',
                        'text-anchor': 'middle'
                    },
                    parent: SVG
                })
                label.innerHTML = finalConfig.label_axis_x_values![i]
            }
        }

        // SCALE LINES & LABELS
        if (finalConfig.label_axis_y_show) {

            if (finalConfig.series_stacked && finalDataset.usableDataset.length > 1) {
                mutableDataset.forEach((ds) => {
  
                    createShape({
                        shape: Shape.LINE,
                        config: {
                            x1: drawingArea.left,
                            x2: drawingArea.left,
                            y1: drawingArea.bottom - ds.height_position!,
                            y2: drawingArea.bottom - ds.height_position! + ds.serie_height!,
                            stroke: ds.color,
                            'stroke-width': 1,
                            'stroke-linecap': 'round',
                        },
                        parent: SVG
                    })
                    createShape({
                        shape: Shape.LINE,
                        config: {
                            x1: drawingArea.right,
                            x2: drawingArea.right,
                            y1: drawingArea.bottom - ds.height_position!,
                            y2: drawingArea.bottom - ds.height_position! + ds.serie_height!,
                            stroke: ds.color,
                            'stroke-width': 1,
                            'stroke-linecap': 'round',
                        },
                        parent: SVG
                    })

                    ds.individual_scale?.ticks.reverse().forEach((tick: number, i: number) => {

                        const y = drawingArea.bottom - ds.height_position! + (i * (ds.serie_height! / (ds.individual_scale!.ticks.length - 1)));
                        console.log(y, tick)

                        const label = createShape({
                            shape: Shape.TEXT,
                            config: {
                                x: drawingArea.left! + finalConfig.label_axis_y_offset_x! - 6,
                                y,
                                'font-size': finalConfig.label_axis_y_font_size,
                                'font-weight': finalConfig.label_axis_y_bold ? 'bold' : 'normal',
                                fill: ds.color,
                                'text-anchor': 'end'
                            },
                            parent: SVG
                        })
                        label.innerHTML = dataLabel({
                            p: finalConfig.label_prefix!,
                            v: tick,
                            s: finalConfig.label_suffix!,
                            r: finalConfig.label_axis_y_rounding!
                        });

                        if (finalConfig.grid_lines_x_show) {
                            createShape({
                                shape: Shape.LINE,
                                config: {
                                    x1: drawingArea.left,
                                    x2: drawingArea.right,
                                    y1: y,
                                    y2: y,
                                    stroke: ds.color,
                                    'stroke-width': finalConfig.grid_lines_x_stroke_width,
                                    'stroke-linecap': 'round',
                                    'stroke-dasharray': finalConfig.grid_lines_x_stroke_dasharray
                                },
                                parent: SVG
                            })
                        }

                    })
                })
            } else {
                scale.ticks.forEach((tick: number, i: number) => {
                    const y = drawingArea.bottom - (i * (drawingArea.height / (scale.ticks.length - 1)));
                    const label = createShape({
                        shape: Shape.TEXT,
                        config: {
                            x: drawingArea.left! + finalConfig.label_axis_y_offset_x! - 6,
                            y,
                            'font-size': finalConfig.label_axis_y_font_size,
                            'font-weight': finalConfig.label_axis_y_bold ? 'bold' : 'normal',
                            fill: finalConfig.label_axis_y_color,
                            'text-anchor': 'end'
                        },
                        parent: SVG
                    })
                    label.innerHTML = dataLabel({
                        p: finalConfig.label_prefix!,
                        v: tick,
                        s: finalConfig.label_suffix!,
                        r: finalConfig.label_axis_y_rounding!
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

        }

        // GRID <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< GRID //

        // SELECTORS

        for (let i = 0; i < finalDataset.maxSeriesLength; i += 1) {
            if (finalConfig.selector_show) {
                const selector = createShape({
                    shape: Shape.LINE,
                    config: {
                        x1: drawingArea.left! + (i * slot) + (slot / 2),
                        x2: drawingArea.left! + (i * slot) + (slot / 2),
                        y1: drawingArea.top,
                        y2: drawingArea.bottom,
                        stroke: 'transparent',
                        'stroke-width': finalConfig.selector_stroke_width,
                        'stroke-dasharray': finalConfig.selector_stroke_dasharray,
                        'stroke-linecap': 'round'
                    },
                    parent: SVG
                });
                SVG_ELEMENTS.selectors.push(selector as SVGLineElement)
            }
        }

        // PLOTS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> PLOTS //

        mutableDataset.forEach((ds) => {
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

            ds.plots.forEach((plot) => {
                const p = createShape({
                    shape: Shape.CIRCLE,
                    config: {
                        cx: plot.x,
                        cy: plot.y,
                        r: finalConfig.plot_radius!,
                        fill: ds.color,
                        stroke: finalConfig.plot_stroke!,
                        'stroke-width': finalConfig.plot_stroke_width!
                    },
                    parent: SVG
                })
                SVG_ELEMENTS.plots.push({ element: p as SVGCircleElement, plot })
            })
        })

        // PLOTS <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< PLOTS //


        // MOUSE TRAPS

        for (let i = 0; i < finalDataset.maxSeriesLength; i += 1) {
            const trap = createShape({
                shape: Shape.RECT,
                config: {
                    x: drawingArea.left! + (i * slot),
                    y: drawingArea.top,
                    width: slot,
                    height: drawingArea.height,
                    fill: 'transparent'
                },
            })

            SVG.appendChild(trap)
            trap.addEventListener('mouseenter', () => hoverDatapoint(i))
            trap.addEventListener('mouseout', resetDatapoints)
        }

        if (init) {
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
    } as ChartXY
}
