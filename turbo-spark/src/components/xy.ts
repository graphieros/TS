import { Coordinate, ConfigXY, Shape, ChartXY, STACK_XY, SerieXY, TooltipSerieContent, Element, CssClass, ChartClass, SerieXYType, ChartZoom } from "../../types/main";
import { config_sparkline } from "../configs/xy";
import { CONSTANT } from "../utils/constants";
import { calcTooltipPosition, calculateHeightRatioAuto, calculateNiceScale, convertColorToHex, createLegend, createProxyObservable, createShape, createSmoothPath, createTitle, createTooltip, createUid, dataLabel, palette, useNestedProp } from "../utils/main";
import * as detector from "../utils/chartDetector"
import { ChartLegend, ChartTitle } from "../../types/common";

export default function Sparkline({
    container,
    config = {},
    dataset
}: {
    container: HTMLElement;
    config?: ConfigXY;
    dataset: SerieXY[];
}) {

    // IDEAS
    // if a datapoint is null, show exclam icon ?

    const SVG = document.createElementNS(CONSTANT.XMLNS, "svg");
    SVG.classList.add(CssClass.CHART_SVG);
    SVG.classList.add(ChartClass.XY);
    SVG.style.userSelect = 'none';

    const SVG_ELEMENTS: STACK_XY = {
        plots: [],
        selectors: [],
        zooms: []
    };
    const tooltipId = createUid();
    const zoomerId = createUid();
    const tooltip = createTooltip(tooltipId);
    const clientPosition = {
        x: 0,
        y: 0,
    };
    
    let init = true;
    let isTooltip = false;
    let finalDataset: any;
    let immutableDataset: SerieXY[] = [];
    let mutableDataset: SerieXY[] = [];
    let tooltipContent = "";
    let finalConfig: ConfigXY = useNestedProp<ConfigXY>({
        defaultConfig: config_sparkline,
        userConfig: config ?? {}
    });

    const drawingArea = {
        left: finalConfig.chart_padding_left,
        top: finalConfig.chart_padding_top,
        right: finalConfig.chart_width! - finalConfig.chart_padding_right!,
        bottom: finalConfig.chart_height! - finalConfig.chart_padding_bottom!,
        width: finalConfig.chart_width! - finalConfig.chart_padding_left! - finalConfig.chart_padding_right!,
        height: finalConfig.chart_height! - finalConfig.chart_padding_top! - finalConfig.chart_padding_bottom!
    };

    // ZOOMER
    // FIXME: adapt config
    const zoomer = createShape({
        shape: Shape.RECT,
        config: {
            fill: finalConfig.zoom_background,
            x: drawingArea.left,
            y: drawingArea.top,
            height: drawingArea.height,
            width: 0,
            stroke: 'none',
        },
        parent: SVG
    })
    zoomer.setAttribute('id', zoomerId);
    zoomer.style.opacity = String(finalConfig.zoom_opacity);


    function setZoomer(ds: any) {
        const w = (Math.abs(zoom.end - zoom.start)) * (drawingArea.width / ds.maxSeriesLength)
        const s = (Math.min(...[zoom.start, zoom.end])) * (drawingArea.width / ds.maxSeriesLength);
        // FIXME: set stroke if w > 0;
        if (w > 0) {
            zoomer.setAttribute('stroke', finalConfig.zoom_stroke!);
            zoom.active = true;
        } else {
            zoomer.setAttribute('stroke', 'none');
            zoom.active = false;
        }
        zoomer.setAttribute('x', String(drawingArea.left! + s))
        zoomer.setAttribute('width', String(w <= 0 ? 0 : w));
    }

    function resetZoomer() {
        zoomer.setAttribute('stroke', 'none');
        zoomer.setAttribute('width', '0');
    }

    function setTooltipVisibility(isVisible: boolean) {
        tooltip.style.opacity = isVisible ? '1' : '0';
    }


    const LEGEND = createLegend(finalConfig satisfies ChartLegend);
    let TITLE: any;
    let segregated: string[] = [];
    let bars = 0;
    let isMouseDown = false;

    const PALETTE = finalConfig.chart_custom_palette!.length ? finalConfig.chart_custom_palette : palette;

    const TABLE_WRAPPER = document.createElement(Element.DIV);

    function resetChart() {
        SVG.innerHTML = "";
        LEGEND.innerHTML = "";
        TABLE_WRAPPER.innerHTML = "";
        TITLE = "";
        SVG_ELEMENTS.plots = [];
        SVG_ELEMENTS.selectors = [];
        SVG.prepend(zoomer);
        makeChart();
    }

    const zoom: ChartZoom = {
        active: false,
        start: 0,
        end: 0,
        absoluteStart: null,
        memoryStart: 0,
        memoryEnd: 0,
    };

    function resetZoom() {
        zoom.memoryStart = zoom.start;
        zoom.memoryEnd = zoom.end;
        zoom.active = false;
        zoom.start = 0;
        zoom.end = 0;
        zoom.absoluteStart = null;
    }

    function hoverDatapoint(index: number) {

        // TOOLTIP
        if (finalConfig.tooltip_show) {
            isTooltip = true;
            const selectedDatapoints: TooltipSerieContent[] = mutableDataset.map((ds: SerieXY) => {
                return {
                    color: ds.color!,
                    name: ds.name!,
                    value: ds.VALUES![index] ?? null,
                }
            });
    
            if (finalConfig.tooltip_custom && typeof finalConfig.tooltip_custom === 'function') {
    
                if (typeof finalConfig.tooltip_custom({
                    index,
                    series: selectedDatapoints
                }) === 'string') {

                    let period = ""
                    if (Math.abs(zoom.memoryEnd - zoom.memoryStart) > 0) {
                        period = finalConfig.label_axis_x_values!.slice(Math.min(zoom.memoryStart, zoom.memoryEnd), Math.max(zoom.memoryStart, zoom.memoryEnd))[index] ?? null
                    } else {
                        period = finalConfig.label_axis_x_values![index] ?? null
                    }

                    tooltipContent = finalConfig.tooltip_custom({
                        index,
                        series: selectedDatapoints,
                        period,
                    });
                } else {
                    console.warn('\n\nInvalid custom_tooltip return type:\n\ncustom_tooltip config attriute must return a string\n\n')
                }
    
            } else {
                let html = '';

                let period = ""
                    if (Math.abs(zoom.memoryEnd - zoom.memoryStart) > 0) {
                        period = finalConfig.label_axis_x_values!.slice(Math.min(zoom.memoryStart, zoom.memoryEnd), Math.max(zoom.memoryStart, zoom.memoryEnd))[index] ?? null
                    } else {
                        period = finalConfig.label_axis_x_values![index] ?? null
                    }
    
                if (period) {
                    html += `<div class="${CssClass.CHART_TOOLTIP_PERIOD}">${period}</div>`
                }
        
                selectedDatapoints.forEach(p => {
                    html += `
                        <div class="${CssClass.CHART_TOOLTIP_CONTENT}" style="display: flex; flex-direction: row; align-items: center; gap: 4px; margin: 8px 0">
                            <div class="${CssClass.CHART_TOOLTIP_MARKER}" style="width:${finalConfig.tooltip_marker_size}px; display: flex; align-items:center">
                                <svg height="${finalConfig.tooltip_marker_size}" width="${finalConfig.tooltip_marker_size}" viewBox="0 0 10 10"><circle cx="5" cy="5" r="5" fill="${p.color}"/></svg>
                            </div>
                            <div class="${CssClass.CHART_TOOLTIP_NAME_VALUE}">
                                <span>${p.name} : </span>
                                <b>${dataLabel({
                                    p: finalConfig.label_prefix ?? '',
                                    v: p.value,
                                    s: finalConfig.label_suffix ?? '',
                                    r: finalConfig.tooltip_value_rounding ?? 0
                                })}</b>
                            </div>
                        </div>
                    `
                });
        
                tooltipContent = `
                    <div class="${CssClass.CHART_TOOLTIP}" style="background:${finalConfig.tooltip_background_color}; color:${finalConfig.tooltip_color}; font-size:${finalConfig.tooltip_font_size}px; padding:${finalConfig.tooltip_padding}px; border-radius:${finalConfig.tooltip_border_radius}px;border:${finalConfig.tooltip_border}; box-shadow:${finalConfig.tooltip_box_shadow};max-width:${finalConfig.tooltip_max_width}px">
                        ${html}
                    </div>
                `;
            }
        }


        // PLOT HIGHLIGHTING
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
            });
        }
    }

    function resetDatapoints() {
        isTooltip = false;
        SVG_ELEMENTS.plots.forEach((p) => {
            p.element.setAttribute('r', String(finalConfig.plot_radius))
        });
        SVG_ELEMENTS.selectors.forEach((s) => {
            s.setAttribute('stroke', 'transparent')
        });
    }
    
    function makeChart() {

        TITLE = createTitle(finalConfig satisfies ChartTitle);

        const viewBox = `0 0 ${finalConfig.chart_width} ${finalConfig.chart_height}`
        SVG.setAttribute('viewBox', viewBox)
        SVG.style.backgroundColor = finalConfig.chart_background!;
        SVG.style.width = "100%";

        // DRAWING AREA

        finalDataset = detector.detectChart((zoom.active ? dataset.map(ds => {
            return {
                ...ds,
                values: ds.values.slice(Math.min(zoom.start, zoom.end), Math.max(zoom.start, zoom.end))
            }
        }).filter(ds => ds.values.length) : dataset), segregated);

        const slot = drawingArea.width / finalDataset.maxSeriesLength;

        const scale = calculateNiceScale(finalDataset.min < 0 ? finalDataset.min : 0, finalDataset.max, finalConfig.grid_axis_y_scale_ticks!);

        if (detector.isSimpleArrayOfNumbers(finalDataset.usableDataset)) {

            console.warn(`XY chart dataset datastructure is incorrect. Please provide dataset as an array of objects of shape:

[
    {
        type: 'bar' | 'line'
        name: string,
        values: number[]
    },
    {...}
]
            `)
            
        } else {

            let height_position = 0;
            
            immutableDataset = finalDataset.usableDataset.map((ds:SerieXY, k: number) => {
                return {
                    ...ds,
                    type: ds.type ?? SerieXYType.LINE,
                    id: `xy_serie_${k}`,
                    color: ds.color ? convertColorToHex(ds.color) : PALETTE![k] || PALETTE![k % PALETTE!.length]
                }
            }) as SerieXY[];

            const multipleScales = immutableDataset.filter(ds => !segregated.includes(ds.id)).map((ds: SerieXY) => {
                const ds_min = Math.min(...ds.VALUES);
                const ds_max = Math.max(...ds.VALUES);
                return calculateNiceScale(ds_min < 0 ? ds_min : 0, ds_max, ds.datapoint_scale_ticks ?? finalConfig.grid_axis_y_scale_ticks!)
            });

            const totalStackGap = finalConfig.series_stacked ? finalConfig.series_stack_gap! * (immutableDataset.filter(ds => !segregated.includes(ds.id)).length - 1) : 0;

            mutableDataset = immutableDataset.filter((ds:SerieXY) => !segregated.includes(ds.id)).map((ds: SerieXY) => {
                const serie_height = finalConfig.series_stacked 
                ? ds.datapoint_height_ratio
                    ?  (drawingArea.height - totalStackGap) * (immutableDataset.filter((ds:SerieXY) => !segregated.includes(ds.id)).length === 1 ? 1 : ds.datapoint_height_ratio)
                    :  (drawingArea.height - totalStackGap) * calculateHeightRatioAuto(immutableDataset.filter(ds => !segregated.includes(ds.id)))
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

                const zero_position = drawingArea.bottom - height_position - ((((Math.abs(individual_scale.min))) / (individual_scale.max + (Math.abs(individual_scale.min)))) * ds.serie_height!) - (k > 0 ? (finalConfig.series_stacked ? finalConfig.series_stack_gap! : 0) : 0);

                const plots: Coordinate[] = ds.VALUES.map((v: number, i: number) => {
                    const plot_height = (((Math.abs(v) + Math.abs(individual_scale.min)) / (Math.abs(individual_scale.max) + Math.abs(individual_scale.min))) * (ds.serie_height!)) - (Math.abs(individual_scale.min) / (Math.abs(individual_scale.max) + Math.abs(individual_scale.min)) * ds.serie_height!);

                    return {
                        x: drawingArea.left! + (i * slot) + (slot / 2),
                        y: drawingArea.bottom - height_position - (((v + (Math.abs(individual_scale.min))) / (individual_scale.max + (Math.abs(individual_scale.min)))) * ds.serie_height!) - (k > 0 ? (finalConfig.series_stacked ? finalConfig.series_stack_gap! : 0) : 0),
                        absoluteIndex: i,
                        plot_height
                    }
                });

                if (finalConfig.series_stacked) {
                    height_position += ds.serie_height! + (k > 0 ? (finalConfig.series_stacked ? finalConfig.series_stack_gap! : 0) : 0);
                }

                let path = "";
                let area_path = "";

                if ([true, false].includes(ds.datapoint_line_smooth!)) {
                    if(ds.datapoint_line_smooth) {
                        path = createSmoothPath(plots, finalConfig.line_smooth_force)
                        area_path = `${plots[0].x},${zero_position} ${path} L${plots.at(-1)!.x}, ${zero_position}`
                    } else {
                        path = plots.map(p => `${p.x},${p.y} `).toString().trim();
                        area_path = `${plots[0].x},${zero_position} ${path} ${plots.at(-1)!.x}, ${zero_position}`
                    }
                } else {
                    if (finalConfig.line_smooth) {
                        path = createSmoothPath(plots, finalConfig.line_smooth_force)
                        area_path = `${plots[0].x},${zero_position} ${path} L${plots.at(-1)!.x}, ${zero_position}`
                    } else {
                        path = plots.map(p => `${p.x},${p.y} `).toString().trim();
                        area_path = `${plots[0].x},${zero_position} ${path} ${plots.at(-1)!.x}, ${zero_position}`
                    }
                }
                

                return {
                    ...ds,
                    zero_position,
                    height_position,
                    individual_scale,
                    id: `xy_serie_${k}`,
                    plots,
                    path,
                    area_path
                }
            });

            bars = mutableDataset.filter(ds => ds.type === SerieXYType.BAR).length;
        }

        const zeroPosition = drawingArea.bottom - ((Math.abs(scale.min) / (scale.max + Math.abs(scale.min))) * drawingArea.height);


        // GRID >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> GRID //

        if (finalConfig.chart_area_background_show) {
            if (finalConfig.series_stacked) {
                mutableDataset.forEach((ds: SerieXY) => {
                    const serieBg = createShape({
                        shape: Shape.RECT,
                        config: {
                            x: drawingArea.left,
                            y: drawingArea.bottom - ds.height_position!,
                            fill: ds.color,
                            width: drawingArea.width,
                            height: ds.serie_height
                        },
                        parent: SVG
                    });
                    serieBg.style.opacity = String(finalConfig.chart_area_background_opacity);
                });
            } else {
                const serieBg = createShape({
                    shape: Shape.RECT,
                    config: {
                        x: drawingArea.left,
                        y: drawingArea.top,
                        width: drawingArea.width,
                        height: drawingArea.height
                    },
                    parent: SVG
                });
                serieBg.style.opacity = String(finalConfig.chart_area_background_opacity);
            }
        }

        if (finalConfig.grid_axis_y_show && !finalConfig.series_stacked) {
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
            });
        }

        if (finalConfig.grid_lines_y_show) {
            if (finalConfig.series_stacked) {
                mutableDataset.forEach((ds: SerieXY) => {
                    for(let i = 0; i < finalDataset.maxSeriesLength; i += 1) {
                        const line = createShape({
                            shape: Shape.LINE,
                            config: {
                                x1: drawingArea.left! + (slot * i),
                                x2: drawingArea.left! + (slot * i),
                                y1: drawingArea.bottom - ds.height_position!,
                                y2: drawingArea.bottom - ds.height_position! + ds.serie_height!,
                                stroke: ds.color,
                                'stroke-width': finalConfig.grid_lines_y_stroke_width,
                                'stroke-linecap': 'round',
                                'stroke-dasharray': finalConfig.grid_lines_y_stroke_dasharray
                            },
                            parent: SVG
                        });
                        line.style.opacity = String(finalConfig.grid_lines_y_stroke_opacity);
                    }
                });
            } else {
                for (let i = 1; i < finalDataset.maxSeriesLength + 1; i += 1) {
                    const line = createShape({
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
                    });
                    line.style.opacity = String(finalConfig.grid_lines_y_stroke_opacity);
                }
            }
        }

        if (finalConfig.label_axis_x_show) {
            for (let i = 0; i < finalDataset.maxSeriesLength; i += 1) {
                const label = createShape({
                    shape: Shape.TEXT,
                    config: {
                        // x: drawingArea.left! + (slot * i) + (slot / 2) + finalConfig.label_axis_x_offset_x!,
                        // y: drawingArea.bottom + (finalConfig.label_axis_x_font_size! * 1.5) + finalConfig.label_axis_x_offset_y!,
                        fill: finalConfig.label_axis_x_color,
                        'font-size': finalConfig.label_axis_x_font_size,
                        'font-weight': finalConfig.label_axis_x_bold ? 'bold' : 'normal',
                        'text-anchor': 'middle'
                    },
                    parent: SVG
                });
                if (zoom.active) {
                    label.innerHTML = finalConfig.label_axis_x_values!.slice(Math.min(zoom.start, zoom.end), Math.max(zoom.start, zoom.end))[i] ?? i
                } else {
                    label.innerHTML = finalConfig.label_axis_x_values![i] ?? i;
                }
                label.setAttribute('transform', `translate(${drawingArea.left! + (slot * i) + (slot / 2) + finalConfig.label_axis_x_offset_x!}, ${drawingArea.bottom + (finalConfig.label_axis_x_font_size! * 1.5) + finalConfig.label_axis_x_offset_y!}), rotate(${finalConfig.label_axis_x_rotation})`)
            }
        }

        // SCALE LINES & LABELS
        if (finalConfig.label_axis_y_show) {

            if (finalConfig.series_stacked && finalDataset.usableDataset.length > 1) {
                mutableDataset.forEach((ds) => {

                    const serieLabel = createShape({
                        shape: Shape.TEXT,
                        config: {
                            fill: ds.color,
                            'text-anchor': 'middle'
                        },
                        parent: SVG
                    });

                    serieLabel.innerHTML = ds.name!;
                    serieLabel.setAttribute('transform', `translate(${drawingArea.left! + finalConfig.grid_axis_y_name_offset_x!}, ${drawingArea.bottom - ds.height_position! + ds.serie_height! / 2}) rotate(-90)`);
                    serieLabel.setAttribute('font-size', String(finalConfig.grid_axis_names_font_size));

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
                    });
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
                    });

                    ds.individual_scale?.ticks.reverse().forEach((tick: number, i: number) => {

                        const y = drawingArea.bottom - ds.height_position! + (i * (ds.serie_height! / (ds.individual_scale!.ticks.length - 1)));

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
                        });

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
                            });
                        }
                    });
                });
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
                    });

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
                        });
                    }
                });
            }
        }

        // AXIS NAMES
        if (finalConfig.grid_axis_x_name) {
            const xAxisName = createShape({
                shape: Shape.TEXT,
                config: {
                    fill: finalConfig.grid_axis_names_color,
                    x: drawingArea.left! + drawingArea.width / 2,
                    y: drawingArea.bottom + finalConfig.grid_axis_x_name_offset_y!,
                    'text-anchor': 'middle'
                },
                parent: SVG
            });

            xAxisName.setAttribute('font-size', String(finalConfig.grid_axis_names_font_size));
            xAxisName.innerHTML = finalConfig.grid_axis_x_name;
        }

        if (finalConfig.grid_axis_y_name && !finalConfig.series_stacked) {
            const yAxisName = createShape({
                shape: Shape.TEXT,
                config: {
                    fill: finalConfig.grid_axis_names_color,
                    'text-anchor': 'middle'
                },
                parent: SVG
            });

            yAxisName.innerHTML = finalConfig.grid_axis_y_name;
            yAxisName.setAttribute('transform', `translate(${drawingArea.left! + finalConfig.grid_axis_y_name_offset_x!}, ${drawingArea.bottom - drawingArea.height / 2}) rotate(-90)`);
            yAxisName.setAttribute('font-size', String(finalConfig.grid_axis_names_font_size));
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
                SVG_ELEMENTS.selectors.push(selector as SVGLineElement);
            }
        }

        // PLOTS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> PLOTS //

        // BARS
        mutableDataset.filter(ds => ds.type === SerieXYType.BAR).forEach((ds, k) => {
            if (finalConfig.series_stacked) {
                ds.plots.forEach((plot, i) => {
                    const bar = createShape({
                        shape: Shape.RECT,
                        config: {
                            x: (plot.x - slot / 2) + (slot * finalConfig.bar_group_gap_proportion! / 2),
                            y: ds.VALUES[i] >= 0 ? plot.y : ds.zero_position,
                            height: plot.plot_height,
                            width: slot - (slot * finalConfig.bar_group_gap_proportion!),
                            fill: ds.color
                        },
                        parent: SVG
                    });
                    bar.classList.add(CssClass.CHART_BAR);
                });
            } else {
                ds.plots.forEach((plot, i) => {
                    const bar = createShape({
                        shape: Shape.RECT,
                        config: {
                            x: (plot.x - slot / 2) + (slot * finalConfig.bar_group_gap_proportion! / 2) + (k > 0 ? (slot - finalConfig.bar_group_gap_proportion! * slot) / bars * k : 0),
                            y: ds.VALUES[i] >= 0 ? plot.y : ds.zero_position,
                            height: plot.plot_height,
                            width: (slot - finalConfig.bar_group_gap_proportion! * slot) / bars,
                            fill: ds.color,
                            stroke: finalConfig.bar_stroke,
                            'stroke-width': finalConfig.bar_stroke_width,
                            rx: finalConfig.bar_border_radius
                        },
                        parent: SVG
                    });
                    bar.classList.add(CssClass.CHART_BAR);
                });
            }
        });

        // LINES
        mutableDataset.filter(ds => ds.type === SerieXYType.LINE).forEach((ds) => {

            // AREA
            if (ds.datapoint_line_show_area) {
                const area = createShape({
                    shape: Shape.PATH,
                    config: {
                        d: `M${ds.area_path}Z`,
                        fill: ds.color,
                        stroke: 'transparent'
                    },
                    parent: SVG
                })
                area.classList.add(CssClass.CHART_LINE_AREA);
                area.style.opacity = String(finalConfig.line_area_opacity);
            }

            const pathSheathed = createShape({
                shape: Shape.PATH,
                config: {
                    d: `M${ds.path}`,
                    stroke: finalConfig.chart_background,
                    'stroke-width': (ds.datapoint_line_stroke_width || finalConfig.line_stroke_width || 1) * 2,
                    fill: 'none'
                },
                parent: SVG
            });

            pathSheathed.classList.add(CssClass.CHART_LINE_SHEATHED);

            const path = createShape({
                shape: Shape.PATH,
                config: {
                    d: `M${ds.path}`,
                    stroke: ds.color,
                    'stroke-width': ds.datapoint_line_stroke_width || finalConfig.line_stroke_width || 1,
                    fill: 'none'
                },
                parent: SVG
            });

            path.classList.add(CssClass.CHART_LINE);

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
                });
                p.classList.add(CssClass.CHART_LINE_PLOT);
                SVG_ELEMENTS.plots.push({ element: p as SVGCircleElement, plot });
            });
        });

        // PLOTS <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< PLOTS //

        // ZERO POSITION (non stacked)
        if (finalConfig.grid_axis_x_show && !finalConfig.series_stacked) {
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
            });
        }

        // DATA LABELS
        // BAR DATA LABELS
        mutableDataset.filter(ds => ds.type === SerieXYType.BAR).forEach((ds, k) => {
            if ([true, false].includes(ds.datapoint_datalabel_show!) && ds.datapoint_datalabel_show) {
                ds.plots.forEach((plot, i) => {

                    if (finalConfig.series_stacked) {
                        const label = createShape({
                            shape: Shape.TEXT,
                            config: {
                                fill: finalConfig.datalabel_use_serie_color ? ds.color : finalConfig.datalabel_default_color,
                                x: plot.x,
                                y: ds.VALUES[i] >= 0 ? plot.y + finalConfig.datalabel_offset_y! : ds.zero_position! + finalConfig.datalabel_offset_y!,
                                'text-anchor': 'middle'
                            },
                            parent: SVG
                        });
                        label.setAttribute('font-size', String(finalConfig.datalabel_font_size));
    
                        label.innerHTML = dataLabel({
                            p: finalConfig.label_prefix!,
                            v: ds.VALUES![i],
                            s: finalConfig.label_suffix!,
                            r: finalConfig.datalabel_rounding ?? 0
                        });
                    } else {
                        const label = createShape({
                            shape: Shape.TEXT,
                            config: {
                                fill: finalConfig.datalabel_use_serie_color ? ds.color : finalConfig.datalabel_default_color,
                                x: (plot.x - slot / 2) + (slot * finalConfig.bar_group_gap_proportion! / 2) + (k > 0 ? (slot - finalConfig.bar_group_gap_proportion! * slot) / bars * k : 0) + ((slot - finalConfig.bar_group_gap_proportion! * slot) / bars / 2),
                                y: ds.VALUES[i] >= 0 ? plot.y + finalConfig.datalabel_offset_y! : ds.zero_position! + finalConfig.datalabel_offset_y!,
                                'text-anchor': 'middle'
                            },
                            parent: SVG
                        });
                        label.setAttribute('font-size', String(finalConfig.datalabel_font_size));
    
                        label.innerHTML = dataLabel({
                            p: finalConfig.label_prefix!,
                            v: ds.VALUES![i],
                            s: finalConfig.label_suffix!,
                            r: finalConfig.datalabel_rounding ?? 0
                        });
                    }

                });
            } else {
                if (finalConfig.datalabel_show && ![true, false].includes(ds.datapoint_datalabel_show!)) {

                    ds.plots.forEach((plot, i) => {
                        if (finalConfig.series_stacked) {
                            const label = createShape({
                                shape: Shape.TEXT,
                                config: {
                                    fill: finalConfig.datalabel_use_serie_color ? ds.color : finalConfig.datalabel_default_color,
                                    x: plot.x,
                                    y: ds.VALUES[i] >= 0 ? plot.y + finalConfig.datalabel_offset_y! : ds.zero_position! + finalConfig.datalabel_offset_y!,
                                    'text-anchor': 'middle'
                                },
                                parent: SVG
                            });
    
                            label.setAttribute('font-size', String(finalConfig.datalabel_font_size));
    
                            label.innerHTML = dataLabel({
                                p: finalConfig.label_prefix!,
                                v: ds.VALUES![i],
                                s: finalConfig.label_suffix!,
                                r: finalConfig.datalabel_rounding ?? 0
                            });
                        } else {
                            const label = createShape({
                                shape: Shape.TEXT,
                                config: {
                                    fill: finalConfig.datalabel_use_serie_color ? ds.color : finalConfig.datalabel_default_color,
                                    x: (plot.x - slot / 2) + (slot * finalConfig.bar_group_gap_proportion! / 2) + (k > 0 ? (slot - finalConfig.bar_group_gap_proportion! * slot) / bars * k : 0) + ((slot - finalConfig.bar_group_gap_proportion! * slot) / bars / 2),
                                    y: ds.VALUES[i] >= 0 ? plot.y + finalConfig.datalabel_offset_y! : ds.zero_position! + finalConfig.datalabel_offset_y!,
                                    'text-anchor': 'middle'
                                },
                                parent: SVG
                            });
    
                            label.setAttribute('font-size', String(finalConfig.datalabel_font_size));
    
                            label.innerHTML = dataLabel({
                                p: finalConfig.label_prefix!,
                                v: ds.VALUES![i],
                                s: finalConfig.label_suffix!,
                                r: finalConfig.datalabel_rounding ?? 0
                            });
                        }
                    });
                }
            }
        })

        // LINE DATA LABELS
        mutableDataset.filter(ds => ds.type === SerieXYType.LINE).forEach((ds, _k) => {
            if ([true, false].includes(ds.datapoint_datalabel_show!) && ds.datapoint_datalabel_show) {
                ds.plots.forEach((plot, i) => {
                    const label = createShape({
                        shape: Shape.TEXT,
                        config: {
                            fill: finalConfig.datalabel_use_serie_color ? ds.color : finalConfig.datalabel_default_color,
                            x: plot.x,
                            y: plot.y + finalConfig.datalabel_offset_y!,
                            'text-anchor': 'middle'
                        },
                        parent: SVG
                    });

                    label.setAttribute('font-size', String(finalConfig.datalabel_font_size));

                    label.innerHTML = dataLabel({
                        p: finalConfig.label_prefix!,
                        v: ds.VALUES![i],
                        s: finalConfig.label_suffix!,
                        r: finalConfig.datalabel_rounding ?? 0
                    });
                });
            } else {
                if (finalConfig.datalabel_show && ![true, false].includes(ds.datapoint_datalabel_show!)) {
                    ds.plots.forEach((plot, i) => {
                        const label = createShape({
                            shape: Shape.TEXT,
                            config: {
                                fill: finalConfig.datalabel_use_serie_color ? ds.color : finalConfig.datalabel_default_color,
                                x: plot.x,
                                y: plot.y + finalConfig.datalabel_offset_y!,
                                'text-anchor': 'middle'
                            },
                            parent: SVG
                        });

                        label.setAttribute('font-size', String(finalConfig.datalabel_font_size));

                        label.innerHTML = dataLabel({
                            p: finalConfig.label_prefix!,
                            v: ds.VALUES![i],
                            s: finalConfig.label_suffix!,
                            r: finalConfig.datalabel_rounding ?? 0
                        });
                    });
                }
            }
        });


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
            });

            trap.style.cursor = 'crosshair';

            SVG.appendChild(trap);
            trap.addEventListener('mouseenter', () => hoverDatapoint(i));
            trap.addEventListener('mouseout', resetDatapoints);

            trap.addEventListener('mousedown', () => {
                zoom.start = i;
                zoom.absoluteStart = i + 1;
                isMouseDown = true;
            });
            trap.addEventListener('mousemove', () => {
                if(isMouseDown) {
                    setTooltipVisibility(false);
                    zoom.end = i + 1;
                    if (zoom.start > zoom.end) {
                        zoom.start = zoom.absoluteStart!;
                        zoom.end = i
                    }
                    setZoomer(finalDataset);
                }
            })
            trap.addEventListener('mouseup', () => {
                isMouseDown = false;
                setTooltipVisibility(true);
                resetZoomer()
                resetChart()
                resetZoom()
            })
        }

        // LEGEND

        function segregateLegendItem(id: string) {
            if (segregated.includes(id)) {
                segregated = segregated.filter(el => el !== id);
            } else {
                segregated.push(id);
            }
            resetChart();
        }

        if (finalConfig.legend_show) {
            const LEGEND_WRAPPER = document.createElement(Element.DIV);
            LEGEND_WRAPPER.setAttribute('style', 'display:flex; flex-direction: row; flex-wrap: wrap; gap: 12px; align-items:center; justify-content: center;');

            immutableDataset.forEach((ds: SerieXY) => {
                const LEGEND_ITEM = document.createElement(Element.DIV);
                LEGEND_ITEM.setAttribute('style', 'display: flex; flex-direction: row; gap: 4px; align-items:center; justify-content:center;');
                let html = "";

                html += `<div style="width:${finalConfig.legend_marker_size}px; display:flex; align-items:center;"><svg viewBox="0 0 12 12" height="${finalConfig.legend_marker_size}" width="${finalConfig.legend_marker_size}"><circle cx="5" cy="5" r="5" fill="${ds.color}"/></svg></div>`;
                html += `<span>${ds.name}</span>`;

                LEGEND_ITEM.innerHTML = html;
                LEGEND_ITEM.addEventListener('click', () => segregateLegendItem(ds.id!));
                if (segregated.includes(ds.id)) {
                    LEGEND_ITEM.style.opacity = '0.5';
                } else {
                    LEGEND_ITEM.style.opacity = '1';
                }
                LEGEND_WRAPPER.appendChild(LEGEND_ITEM);
            });

            LEGEND.appendChild(LEGEND_WRAPPER);
        }

        function createTable() {
            const details = document.createElement(Element.DETAILS);
            details.classList.add(CssClass.CHART_TABLE_DETAILS);
            details.setAttribute('style', `background:${finalConfig.table_background};color:${finalConfig.table_color}`);

            const summary = document.createElement(Element.SUMMARY);
            summary.classList.add(CssClass.CHART_TABLE_SUMMARY);
            summary.innerHTML = finalConfig.table_details_title!;
            summary.setAttribute('style', 'cursor: pointer; user-select: none;')

            const table = document.createElement(Element.TABLE);
            table.classList.add(CssClass.CHART_TABLE);
            table.setAttribute('style', 'border-collapse: none; width: 100%;')

            const caption = document.createElement(Element.CAPTION);
            caption.classList.add(CssClass.CHART_TABLE_CAPTION);
            const thead = document.createElement(Element.THEAD);
            const thead_tr = document.createElement(Element.TR);
            const tbody = document.createElement(Element.TBODY);

            caption.innerHTML = finalConfig.table_caption!;

            const head_content = [
                "Period",
                ...mutableDataset.map(ds => ds.name),
            ];

            head_content.forEach(hc => {
                const th = document.createElement(Element.TH);
                th.classList.add(CssClass.CHART_TABLE_TH);
                th.innerHTML = hc;
                thead_tr.appendChild(th);
            });

            for(let i = 0; i < finalDataset.maxSeriesLength; i += 1) {
                const body_tr = document.createElement(Element.TR);
                body_tr.classList.add(CssClass.CHART_TABLE_TR);
                const body_td_first = document.createElement(Element.TD);
                body_td_first.classList.add(CssClass.CHART_TABLE_TD_FIRST);

                if (zoom.active) {
                    body_td_first.innerHTML = finalConfig.label_axis_x_values!.slice(Math.min(zoom.start, zoom.end), Math.max(zoom.start, zoom.end))[i] ?? i;
                } else {
                    body_td_first.innerHTML = finalConfig.label_axis_x_values![i] ?? i;
                }


                body_tr.appendChild(body_td_first);

                mutableDataset.forEach(ds => {
                    const body_td = document.createElement(Element.TD);
                    body_td.innerHTML = ds.VALUES[i] === undefined ? '-' :  String(ds.VALUES![i]);
                    body_td.classList.add(CssClass.CHART_TABLE_TD);
                    body_tr.appendChild(body_td);
                })
                tbody.appendChild(body_tr);
            }

            thead.appendChild(thead_tr);
            table.appendChild(caption);
            table.appendChild(thead);
            table.appendChild(tbody);
            details.appendChild(summary);
            details.appendChild(table);
            TABLE_WRAPPER.appendChild(details)
        }

        finalConfig.table_show && createTable();
        
        // FIRST LOAD
        
        if (init) {
            if (finalConfig.title_show) {
                container.appendChild(TITLE);
            }
            container.appendChild(SVG);
            if (finalConfig.legend_show) {
                container.appendChild(LEGEND);
            }
            
            if (finalConfig.table_show) {
                container.appendChild(TABLE_WRAPPER);
            }

            SVG.addEventListener('mousemove', (e) => {
                clientPosition.x = e.clientX;
                clientPosition.y = e.clientY;
        
                if(isTooltip) {
                    const { top, left } = calcTooltipPosition({
                        tooltip,
                        chart: SVG,
                        clientPosition
                    });

                    tooltip.style.display = "block";
                    tooltip.style.top = String(top) + 'px';
                    tooltip.style.left = String(left) + 'px';
                    tooltip.innerHTML = tooltipContent;

                } else {
                    tooltip.style.display = "none";
                }
            });

            SVG.addEventListener('mouseout', () => {
                isTooltip = false;
            });
            
            init = false;
        }
    }
    makeChart();

    const observedDataset = createProxyObservable(dataset, resetChart);
    const observedConfig = createProxyObservable(finalConfig, resetChart);

    return {
        dataset: observedDataset,
        config: observedConfig
    } as ChartXY;
}
