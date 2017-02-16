var app = app || {};

(function () {
    app.const = {
        // canvas
        WIDTH: 240,
        HEIGHT: 304,
        CELL: 16,
        SPEED_START: 5,
        SPEED_MAX: 45,
        SPEED_STEP: 10,
        SIZE_FIGURE: 4,
        STROKE_STYLE: '#000',
        FILL_STYLE: '#333',
        REMOVE_CELL_ANIMATION_TIME: 50, // ms
        
        // points
        END_LOOP: 10,
        REMOVE_ROW: 100,

        GAME_OVER_FILL: 'rgba(11, 1, 28, 0.85)',

        // figure colors
        FIGURE_COLORS: {
            I: ['#1464e5', '#3b6cba'], // fill\stroke
            C: ['#fc2d2d', '#bf1616'],
            L: ['#f9921b', '#e87f06'],
            RL: ['#e9fc1b', '#d5e80d'],
            T: ['#6aed1e', '#5bd813'],
            Z: ['#3afca8', '#20d888'],
            RZ: ['#853ff4', '#6015d8']
        },
        
        // PANEL
        SCORE_SIZE_ROW: 5
    };
    var r = app.const.CELL, c = (app.const.WIDTH/2)-(r/2),
        r2 = r*2, r3 = r*3, r4 = r*4, sr = r/2;

    // count cells in one row
    app.const.ROW_WIDTH = app.const.WIDTH/r;

    // figures
    app.const.FIGURE = [
        [
            {x:(c-(r*2)), y:-r, left: true},
            {x:(c-r), y:-r},
            {x:c, y:-r, center: true},
            {x:(c+r), y:-r, right: true}
        ], // row
        [
            {x:(c-r), y:-(r*2), left: true},
            {x:c, y:-(r*2), right: true},
            {x:(c-r), y:-r, left: true},
            {x:c, y:-r, right:true}
        ], // rect
        [
            {x:c, y:-(r*3), left: true, right: true},
            {x:c, y:-(r*2), left: true, right: true, center: true},
            {x:c, y:-r, left: true},
            {x:(c+r), y:-r, right: true}
        ], // L
        [
            {x:c, y:-(r*3), left: true, right: true},
            {x:c, y:-(r*2), left: true, right: true, center: true},
            {x:c, y:-r, right: true},
            {x:c-r, y:-r, left: true}
        ], // RL
        [
            {x:c,y:0-r, right: true, left: true},
            {x:(c-r),y:-(r*2) , left: true},
            {x:c,y:0-(r*2), center: true},
            {x:(c+r),y:-(r*2), right: true}
        ], // T
        [
            {x:c-r, y: 0-(r*2), left: true},
            {x:c, y: 0-(r*2), right: true, center: true},
            {x:c, y: 0-r, left: true},
            {x:c+r, y: 0-r, right: true}
        ], // Z
        [
            {x: c+r, y: 0-(r*2), right: true},
            {x: c, y: 0-(r*2), center: true, left: true},
            {x: c, y: 0-r, right: true},
            {x: c-r, y: 0-r, left: true}
        ] // RZ
    ];
    app.const.TYPE_MAP = ['I', 'C', 'L', 'RL', 'T', 'Z', 'RZ'];
    app.const.TRANSFORM_MAP = {
        'I': [
            [[2, -2], [1, -1], null, [-1, 1]],
            [[-2, 2], [-1, 1], null, [1, -1]],
            [[2, -2], [1, -1], null, [-1, 1]],
            [[-2, 2], [-1, 1], null, [1, -1]]
        ],
        'L': [
            [[1, 1], null, [-1, -1], [-2, 0]],
            [[-1, 1], null, [1, -1], [0, -2]],
            [[-1, -1], null, [1, 1], [2, 0]],
            [[1, -1], null, [-1, 1], [0, 2]]
        ],
        'RL': [
            [[1, 1], null, [-1, -1], [0, -2]],
            [[-1, 1], null, [1, -1], [2, 0]],
            [[-1, -1], null, [1, 1], [0, 2]],
            [[1, -1], null, [-1, 1], [-2, 0]]
        ],
        'T': [
            ['1', [1, -1], null, '0'],
            ['1', [1, 1], null, '0'],
            ['1', [-1, 1], null, '0'],
            ['1', [-1, -1], null, '0']
        ],
        'Z': [
            [[1, -1], null, '0', [-2, 0]],
            [[-1, 1], null, [1, 1], [2, 0]],
            [[1, -1], null, '0', [-2, 0]],
            [[-1, 1], null, [1, 1], [2, 0]]
        ],
        'RZ': [
            ['2', null, [-1, -1], [0, -2]],
            [[1, -1], null, '0', [0, 2]],
            ['2', null, [-1, -1], [0, -2]],
            [[1, -1], null, '0', [0, 2]]
        ]
    };
    app.const.POSITION_MAP = {
        'I': [
            [['l', 'r'], ['l', 'r'], ['l', 'r', 'c'], ['l', 'r']],
            ['l', null, 'c', 'r'],
            [['l', 'r'], ['l', 'r'], ['l', 'r', 'c'], ['l', 'r']],
            ['l', null, 'c', 'r']
        ],
        'L': [
            ['r', 'c', 'l', ['l', 'r']],
            [['l', 'r'], ['l', 'r', 'c'], 'r', 'l'],
            ['l', 'c', 'r', ['l', 'r']],
            [['l', 'r'], ['l', 'r', 'c'], 'l', 'r']
        ],
        'RL': [
            ['r', 'c', 'l', ['l', 'r']],
            [['l', 'r'], ['c', 'l', 'r'], 'l', 'r'],
            ['l', 'c', 'r', ['l', 'r']],
            [['l', 'r'], ['c', 'l', 'r'], 'l', 'r']
        ],
        'T': [
            ['l', ['l', 'r'], ['c', 'r'], ['l', 'r']],
            [['l', 'r'], 'r', 'c', 'l'],
            ['r', ['l', 'r'], ['l', 'c'], ['l', 'r']],
            [['l', 'r'], 'l', 'c', 'r']
        ],
        'Z': [
            [['l', 'r'], ['c', 'r'], 'l', ['l', 'r']],
            ['l', ['c', 'r'], 'l', 'r'],
            [['l', 'r'], ['c', 'r'], 'l', ['l', 'r']],
            ['l', ['c', 'r'], 'l', 'r']
        ],
        'RZ': [
            [['l', 'r'], ['c', 'r'], 'l', ['l', 'r']],
            ['r', ['c', 'l'], 'r', 'l'],
            [['l', 'r'], ['c', 'r'], 'l', ['l', 'r']],
            ['r', ['c', 'l'], 'r', 'l']
        ]
    };

    app.const.NEXT_FIGURE_POSITION = {
        'I': [[r, r2+sr], [r2, r2+sr], [r3, r2+sr], [r4, r2+sr]],
        'C': [[r2, r2], [r3, r2], [r2, r3], [r3, r3]],
        'L': [[r2, r], [r2, r2], [r2, r3], [r3, r3]],
        'RL': [[r3, r], [r3, r2], [r3, r3], [r2, r3]],
        'T': [[r2+sr, r3], [r+sr, r2], [r2+sr, r2], [r3+sr, r2]],
        'Z': [[r+sr, r2], [r2+sr, r2], [r2+sr, r3], [r3+sr, r3]],
        'RZ': [[r3+sr, r2], [r2+sr, r2], [r2+sr, r3], [r+sr, r3]]
    };
})();