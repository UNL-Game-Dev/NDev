var x = {
    root: '',
    fileExtension: 'png',
    spriteSheets: {
        player: {
            tileSize: 32,
            data: {
                'hand.R': [
                    [
                        { x: 12, y: 19, z: -1, facing: 'l', orientation: 'sw'},
                        { x: 11, y: 19, z: -1, facing: 'l', orientation: 'sw'},
                        { x: 11, y: 20, z: -1, facing: 'l', orientation: 'sw'},
                        { x: 11, y: 20, z: -1, facing: 'l', orientation: 'sw'},
                        { x: 19, y: 20, z: 1, facing: 'r', orientation: 'se'},
                        { x: 19, y: 20, z: 1, facing: 'r', orientation: 'se'},
                        { x: 19, y: 19, z: 1, facing: 'r', orientation: 'se'},
                        { x: 18, y: 19, z: 1, facing: 'r', orientation: 'se'}
                    ],
                    [
                        { x: 11, y: 20, z: -1, facing: 'l', orientation: 'sw'},
                        { x: 10, y: 20, z: -1, facing: 'l', orientation: 'sw'},
                        { x: 7, y: 20, z: -1, facing: 'l', orientation: 'sw'},
                        { x: 10, y: 21, z: -1, facing: 'l', orientation: 'sw'},
                        { x: 11, y: 20, z: -1, facing: 'l', orientation: 'sw'},
                        { x: 15, y: 20, z: -1, facing: 'l', orientation: 's'},
                        { x: 20, y: 21, z: -1, facing: 'l', orientation: 's'},
                        { x: 15, y: 21, z: -1, facing: 'l', orientation: 's'}
                    ],
                    [
                        { x: 19, y: 20, z: 1, facing: 'r', orientation: 'se'},
                        { x: 16, y: 20, z: 1, facing: 'r', orientation: 's'},
                        { x: 11, y: 21, z: 1, facing: 'r', orientation: 's'},
                        { x: 16, y: 21, z: 1, facing: 'r', orientation: 's'},
                        { x: 19, y: 20, z: 1, facing: 'r', orientation: 'se'},
                        { x: 22, y: 20, z: 1, facing: 'r', orientation: 'se'},
                        { x: 24, y: 20, z: 1, facing: 'r', orientation: 'se'},
                        { x: 22, y: 21, z: 1, facing: 'r', orientation: 'se'}
                    ],
                    [
                        { x: 11, y: 18, z: -1, facing: 'l', orientation: 'w'},
                        { x: 11, y: 16, z: -1, facing: 'l', orientation: 'w'},
                        { x: 8, y: 8, z: -1, facing: 'l', orientation: 'nw'},
                        { x: 6, y: 12, z: -1, facing: 'l', orientation: 'nw'},
                        { x: 19, y: 19, z: 1, facing: 'r', orientation: 'e'},
                        { x: 20, y: 17, z: 1, facing: 'r', orientation: 'e'},
                        { x: 23, y: 7, z: 1, facing: 'r', orientation: 'ne'},
                        { x: 25, y: 11, z: 1, facing: 'r', orientation: 'ne'}
                    ],
                    [
                        { x: 5, y: 10, z: -1, facing: 'l', orientation: 'n'},
                        { x: 5, y: 10, z: -1, facing: 'l', orientation: 'n'},
                        { x: 5, y: 10, z: -1, facing: 'l', orientation: 'n'},
                        { x: 5, y: 10, z: -1, facing: 'l', orientation: 'n'},
                        { x: 27, y: 10, z: 1, facing: 'r', orientation: 'n'},
                        { x: 27, y: 10, z: 1, facing: 'r', orientation: 'n'},
                        { x: 27, y: 10, z: 1, facing: 'r', orientation: 'n'},
                        { x: 27, y: 10, z: 1, facing: 'r', orientation: 'n'}
                    ],
                    [
                        { x: 7, y: 17, z: -1, facing: 'l', orientation: 'w'},
                        { x: 9, y: 23, z: -1, facing: 'l', orientation: 'sw'},
                        { x: 19, y: 23, z: -1, facing: 'l', orientation: 's'},
                        { x: 17, y: 21, z: -1, facing: 'l', orientation: 'sw'},
                        { x: 25, y: 17, z: 1, facing: 'r', orientation: 'e'},
                        { x: 23, y: 23, z: 1, facing: 'r', orientation: 'se'},
                        { x: 13, y: 23, z: 1, facing: 'r', orientation: 's'},
                        { x: 15, y: 21, z: 1, facing: 'r', orientation: 'se'}
                    ],
                    [],
                    [],
                    [],
                    [
                        { x: 10, y: 15, z: -1, facing: 'l', orientation: 'w'},
                        { x: 13, y: 13, z: -1, facing: 'l', orientation: 'w'},
                        { x: 17, y: 14, z: -1, facing: 'l', orientation: 'w'},
                        { x: 15, y: 15, z: -1, facing: 'l', orientation: 'w'},
                        { x: 21, y: 15, z: 1, facing: 'r', orientation: 'e'},
                        { x: 18, y: 13, z: 1, facing: 'r', orientation: 'e'},
                        { x: 14, y: 14, z: 1, facing: 'r', orientation: 'e'},
                        { x: 16, y: 15, z: 1, facing: 'r', orientation: 'e'}
                    ]
                ],
                'hand.L': [
                    [
                        { x: 14, y: 19, z: 1, facing: 'l', orientation: 'sw'},
                        { x: 13, y: 19, z: 1, facing: 'l', orientation: 'sw'},
                        { x: 13, y: 20, z: 1, facing: 'l', orientation: 'sw'},
                        { x: 13, y: 20, z: 1, facing: 'l', orientation: 'sw'},
                        { x: 19, y: 20, z: -1, facing: 'r', orientation: 'se'},
                        { x: 19, y: 20, z: -1, facing: 'r', orientation: 'se'},
                        { x: 19, y: 19, z: -1, facing: 'r', orientation: 'se'},
                        { x: 18, y: 19, z: -1, facing: 'r', orientation: 'se'}
                    ],
                    [
                        { x: 13, y: 20, z: 1, facing: 'l', orientation: 'sw'},
                        { x: 16, y: 20, z: 1, facing: 'l', orientation: 's'},
                        { x: 21, y: 21, z: 1, facing: 'l', orientation: 's'},
                        { x: 16, y: 21, z: 1, facing: 'l', orientation: 's'},
                        { x: 13, y: 20, z: 1, facing: 'l', orientation: 'sw'},
                        { x: 10, y: 20, z: 1, facing: 'l', orientation: 'sw'},
                        { x: 8, y: 20, z: 1, facing: 'l', orientation: 'sw'},
                        { x: 10, y: 21, z: 1, facing: 'l', orientation: 'sw'}
                    ],
                    [
                        { x: 19, y: 20, z: -1, facing: 'r', orientation: 'se'},
                        { x: 16, y: 20, z: -1, facing: 'r', orientation: 's'},
                        { x: 11, y: 21, z: -1, facing: 'r', orientation: 's'},
                        { x: 16, y: 21, z: -1, facing: 'r', orientation: 's'},
                        { x: 19, y: 20, z: -1, facing: 'r', orientation: 'se'},
                        { x: 22, y: 20, z: -1, facing: 'r', orientation: 'se'},
                        { x: 24, y: 20, z: -1, facing: 'r', orientation: 's'},
                        { x: 22, y: 21, z: -1, facing: 'r', orientation: 's'}
                    ],
                    [
                        { x: 13, y: 19, z: 1, facing: 'l', orientation: 'w'},
                        { x: 12, y: 17, z: 1, facing: 'l', orientation: 'w'},
                        { x: 9, y: 7, z: 1, facing: 'l', orientation: 'nw'},
                        { x: 7, y: 11, z: 1, facing: 'l', orientation: 'nw'},
                        { x: 19, y: 19, z: -1, facing: 'r', orientation: 'e'},
                        { x: 20, y: 17, z: -1, facing: 'r', orientation: 'e'},
                        { x: 23, y: 7, z: -1, facing: 'r', orientation: 'ne'},
                        { x: 25, y: 11, z: -1, facing: 'r', orientation: 'ne'}
                    ],
                    [
                        { x: 5, y: 10, z: 1, facing: 'l', orientation: 'nw'},
                        { x: 5, y: 10, z: 1, facing: 'l', orientation: 'nw'},
                        { x: 5, y: 10, z: 1, facing: 'l', orientation: 'nw'},
                        { x: 5, y: 10, z: 1, facing: 'l', orientation: 'nw'},
                        { x: 27, y: 10, z: -1, facing: 'r', orientation: 'ne'},
                        { x: 27, y: 10, z: -1, facing: 'r', orientation: 'ne'},
                        { x: 27, y: 10, z: -1, facing: 'r', orientation: 'ne'},
                        { x: 27, y: 10, z: -1, facing: 'r', orientation: 'ne'}
                    ],
                    [
                        { x: 7, y: 17, z: 1, facing: 'l', orientation: 'w'},
                        { x: 9, y: 23, z: 1, facing: 'l', orientation: 'sw'},
                        { x: 19, y: 23, z: 1, facing: 'l', orientation: 's'},
                        { x: 17, y: 21, z: 1, facing: 'l', orientation: 'sw'},
                        { x: 25, y: 17, z: -1, facing: 'r', orientation: 'e'},
                        { x: 23, y: 23, z: -1, facing: 'r', orientation: 'se'},
                        { x: 13, y: 23, z: -1, facing: 'r', orientation: 's'},
                        { x: 15, y: 21, z: -1, facing: 'r', orientation: 'se'}
                    ],
                    [],
                    [],
                    [],
                    [
                        { x: 10, y: 15, z: 1, facing: 'l', orientation: 'w'},
                        { x: 13, y: 13, z: 1, facing: 'l', orientation: 'w'},
                        { x: 17, y: 14, z: 1, facing: 'l', orientation: 'w'},
                        { x: 15, y: 15, z: 1, facing: 'l', orientation: 'w'},
                        { x: 21, y: 15, z: -1, facing: 'r', orientation: 'e'},
                        { x: 18, y: 13, z: -1, facing: 'r', orientation: 'e'},
                        { x: 14, y: 14, z: -1, facing: 'r', orientation: 'e'},
                        { x: 16, y: 15, z: -1, facing: 'r', orientation: 'e'}
                    ]
                ]
            },
            animations: {
                PlayerStandLeft: {
                    duration: 1000,
                    frames: [
                        [0, 0],
                        [1, 0],
                        [2, 0],
                        [3, 0],
                        [3, 0],
                        [2, 0],
                        [1, 0],
                        [0, 0]
                    ]
                },
                PlayerStandRight: {
                    duration: 1000,
                    frames: [
                        [4, 0],
                        [5, 0],
                        [6, 0],
                        [7, 0],
                        [7, 0],
                        [6, 0],
                        [5, 0],
                        [4, 0]
                    ]
                },
                PlayerWalkLeft: {
                    duration: 650,
                    frames: {
                        start: [0, 1],
                        count: 8
                    }
                },
                PlayerWalkRight: {
                    duration: 650,
                    frames: {
                        start: [0, 2],
                        count: 8
                    }
                },
                PlayerJumpLeft: {
                    duration: 400,
                    frames: {
                        start: [0, 3],
                        count: 4
                    }
                },
                PlayerJumpRight: {
                    duration: 400,
                    frames: {
                        start: [4, 3],
                        count: 4
                    }
                },
                PlayerFallLeft: {
                    duration: 1000,
                    frames: [
                        [0, 4],
                        [1, 4],
                        [2, 4],
                        [3, 4],
                        [3, 4],
                        [2, 4],
                        [1, 4],
                        [0, 4]
                    ]
                },
                PlayerFallRight: {
                    duration: 1000,
                    frames: [
                        [4, 4],
                        [5, 4],
                        [6, 4],
                        [7, 4],
                        [7, 4],
                        [6, 4],
                        [5, 4],
                        [4, 4]
                    ]
                },
                PlayerLandLeft: {
                    duration: 350,
                    frames: {
                        start: [0, 5],
                        count: 4
                    }
                },
                PlayerLandRight: {
                    duration: 350,
                    frames: {
                        start: [4, 5],
                        count: 4
                    }
                },
                PlayerCrouchLeft: {
                    duration: 1000,
                    frames: [
                        [0, 6],
                        [1, 6],
                        [2, 6],
                        [3, 6],
                        [3, 6],
                        [2, 6],
                        [1, 6],
                        [0, 6]
                    ]
                }
                ,
                PlayerCrouchRight: {
                    duration: 1000,
                    frames: [
                        [4, 6],
                        [5, 6],
                        [6, 6],
                        [7, 6],
                        [7, 6],
                        [6, 6],
                        [5, 6],
                        [4, 6]
                    ]
                },
                PlayerCrawlLeft: {
                    duration: 700,
                    frames: {
                        start: [0, 7],
                        count: 8
                    }
                },
                PlayerCrawlRight: {
                    duration: 700,
                    frames: {
                        start: [0, 8],
                        count: 8
                    }
                },
                PlayerShootLeft: {
                    duration: 250,
                    frames: {
                        start: [0, 9],
                        count: 4
                    }
                },
                PlayerShootRight: {
                    duration: 250,
                    frames: {
                        start: [4, 9],
                        count: 4
                    }
                }
            }
        },
        projectile: {
            tileSize: 8
        },
        test_enemy_1: {
            tileSize: 32
        },
        test_enemy_2: {
            tileSize: 32
        },
        pistol: {
            tileSize: 8,
            data: {
                origin: [
                    [
                        { x: 3, y: 4}
                    ]
                ],
                tip: [
                    [
                        { x: 7, y: 2}
                    ]
                ]
            }
        },
        dynamite: {
            tileSize: 16
        },
        harpoon: {
            tileSize: 18,
            data: {
                origin: [
                    [
                        { x: 4, y: 9},
                        { x: 4, y: 9},
                        { x: 4, y: 9},
                        { x: 4, y: 9}
                    ]
                ],
                tip: [
                    [
                        { x: 15, y: 7},
                        { x: 15, y: 7},
                        { x: 15, y: 7},
                        { x: 15, y: 7}
                    ]
                ]
            },
            animations: {
                fire: {
                    duration: 200,
                    frames: {
                        start: [0, 0],
                        count: 4
                    }
                }
                ,
                idle: {
                    duration: 100,
                    frames: {
                        start: [0, 0],
                        count: 1
                    }
                }
            }
        },
        waterfall: {
            tileSize: 32,
            animations: {
                waterfall: {
                    duration: 500,
                    frames: {
                        start: [0, 0],
                        count: 8
                    }
                },
                waterfall_top: {
                    duration: 500,
                    frames: {
                        start: [0, 1],
                        count: 8
                    }
                }
            }
        },
        lava: {
            tileSize: 32,
            animations: {
                lavafall: {
                    duration: 1000,
                    frames: {
                        start: [0, 0],
                        count: 8
                    }
                },
                lavafall_top: {
                    duration: 1000,
                    frames: {
                        start: [0, 1],
                        count: 8
                    }
                }
            }
        }
    }
};
