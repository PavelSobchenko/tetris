var app = app || {};

(function () {
    app.const = {
        // canvas
        WIDTH: 216,
        HEIGHT: 280,
        CELL: 8,
        SPEED_START: 5,
        SPEED_MAX: 45,
        SPEED_STEP: 10,
        SIZE_FIGURE: 4,
        STROKE_STYLE: '#3b6cba',
        FILL_STYLE: '#1464e5',
        REMOVE_CELL_ANIMATION_TIME: 50 // ms
    };
    var r = app.const.CELL, c = (app.const.WIDTH/2)-(r/2);

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
})();