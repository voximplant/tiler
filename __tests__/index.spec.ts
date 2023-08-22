import { expect, use as chaiUse } from 'chai';
import { suite, test } from 'mocha';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import * as chaiAsPromised from 'chai-as-promised';
import { calculateSocketLinearSize, generateMargins, makeId } from '../src/utils';
import { createTiler } from '../src/index';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as rewire from 'rewire';

chaiUse(chaiAsPromised);

function arrFormat(input: unknown): string {
  if (Array.isArray(input)) {
    return `[${input.join(',')}]`;
  }
  return '' + input;
}

function objFormat(input: Record<string, unknown>): string {
  return JSON.stringify(input);
}

suite('Support functions', () => {
  suite('makeId function', () => {
    const ID_LENGTH = 16;
    test('length test', () => {
      const id = makeId(ID_LENGTH);
      expect(id.length).to.be.equal(ID_LENGTH);
    });
    test('random test', () => {
      const id1 = makeId(ID_LENGTH);
      const id2 = makeId(ID_LENGTH);
      expect(id1).not.to.be.equal(id2);
    });
  });
  suite('generateMargins function', () => {
    const testMock = {
      'Number argument': { data: 2, result: [2, 2] },
      'Not number argument': { data: 'FooBar', result: [0, 0] },
      'Undefined argument': { data: void 0, result: [0, 0] },
      'Array with 2 numbers': { data: [2, 4], result: [2, 4] },
      'Array with 1 number': { data: [2], result: [2, 2] },
      'Array with 5 numbers': { data: [2, 4, 8, 16, 32], result: [2, 4] },
      'Array of strings': { data: ['foo', 'bar', 'baz'], result: [0, 0] },
      'Mixed array0': { data: ['foo'], result: [0, 0] },
      'Mixed array1': { data: [2, 'foo'], result: [2, 0] },
      'Mixed array2': { data: ['foo', 2], result: [0, 2] },
      'Mixed array3': { data: [2, 4, 'foo'], result: [2, 4] },
    };

    Object.entries(testMock).forEach((row) =>
      test(`${row[0]}: input ${arrFormat(row[1].data)} output ${arrFormat(row[1].result)}`, () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        const margins = generateMargins(row[1].data);
        expect(margins).to.be.eql(row[1].result);
      })
    );
  });
  suite('calculateSocketLinearSize function', () => {
    const FULL_HD_W = 1920;
    const testMock = [
      { size: FULL_HD_W, margin: 8, slots: 2, expectation: [948, 0] },
      { size: FULL_HD_W, margin: 8, slots: 3, expectation: [629, 0] },
      { size: FULL_HD_W, margin: 7, slots: 3, expectation: [630, 1] },
      { size: FULL_HD_W, margin: 12, slots: 5, expectation: [369, 1] },
    ];
    testMock.forEach((row) => {
      test(`calculation ${row.slots} slots for ${row.size} with margin ${row.margin} = ${arrFormat(
        row.expectation
      )}`, () => {
        const size = calculateSocketLinearSize(row.size, row.margin, row.slots);
        expect(size).to.be.eql(row.expectation);
      });
    });
  });
});

suite('Layout declaration format test', () => {
  test('Positive test', () => {
    const testFx = () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      createTiler({
        width: 1920,
        height: 1080,
        areas: [
          {
            priority: 0,
            width: 1920,
            height: 1080,
            top: 0,
            left: 0,
            grid: [{ fromCount: 1, toCount: 1, colCount: 1, rowCount: 1 }],
          },
        ],
      });
    };
    expect(testFx).not.to.throw();
  });
  suite('Full description validators', () => {
    test('No description must throw exception', () => {
      expect(createTiler).to.throw(TypeError, 'layoutOptions is not set');
    });
    test('Empty description must throw exception', () => {
      const testFx = () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        createTiler({});
      };
      expect(testFx).to.throw(TypeError, 'layoutOptions.width is not a positive number');
    });
  });
  suite('Width validators', () => {
    test('Width === 0 must throw exception', () => {
      const testFx = () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        createTiler({ width: 0 });
      };
      expect(testFx).to.throw(TypeError, 'layoutOptions.width is not a positive number');
    });
    test('Width < 0 must throw exception', () => {
      const testFx = () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        createTiler({ width: -123 });
      };
      expect(testFx).to.throw(TypeError, 'layoutOptions.width is not a positive number');
    });
    test('NaN width must throw exception', () => {
      const testFx = () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        createTiler({ width: 'a' });
      };
      expect(testFx).to.throw(TypeError, 'layoutOptions.width is not a positive number');
    });
  });
  suite('Height validators', () => {
    test('Height === 0 must throw exception', () => {
      const testFx = () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        createTiler({ width: 1920, height: 0 });
      };
      expect(testFx).to.throw(TypeError, 'layoutOptions.height is not a positive number');
    });
    test('Height < 0 must throw exception', () => {
      const testFx = () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        createTiler({ width: 1920, height: -123 });
      };
      expect(testFx).to.throw(TypeError, 'layoutOptions.height is not a positive number');
    });
    test('NaN height must throw exception', () => {
      const testFx = () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        createTiler({ width: 1920, height: 'a' });
      };
      expect(testFx).to.throw(TypeError, 'layoutOptions.height is not a positive number');
    });
  });
  suite('Areas validators', () => {
    test('If no area set must throw exception', () => {
      const testFx = () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        createTiler({ width: 1920, height: 1080 });
      };
      expect(testFx).to.throw(
        TypeError,
        'layoutOptions.area have no items. At least one is required.'
      );
    });
    test('Wrong areas type must throw exception', () => {
      const testFx = () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        createTiler({ width: 1920, height: 1080, areas: 'a' });
      };
      expect(testFx).to.throw(
        TypeError,
        'layoutOptions.area have no items. At least one is required.'
      );
    });
    test('Empty areas array must throw exception', () => {
      const testFx = () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        createTiler({ width: 1920, height: 1080, areas: [] });
      };
      expect(testFx).to.throw(
        TypeError,
        'layoutOptions.area have no items. At least one is required.'
      );
    });
    suite('Validate area content', () => {
      test('Test index in exception', () => {
        const testFx1 = () => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          createTiler({
            width: 1920,
            height: 1080,
            areas: [
              {
                priority: 0,
                width: 1920,
                height: 1080,
                top: 0,
                left: 0,
                grid: [{ rowCount: 1, colCount: 1, toCount: 1, fromCount: 1 }],
              },
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //@ts-ignore
              { priority: 'a' },
            ],
          });
        };
        const testFx2 = () => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          createTiler({
            width: 1920,
            height: 1080,
            areas: [
              {
                priority: 0,
                width: 1920,
                height: 1080,
                top: 0,
                left: 0,
                grid: [{ rowCount: 1, colCount: 1, toCount: 1, fromCount: 1 }],
              },
              {
                priority: 1,
                width: 1920,
                height: 1080,
                top: 0,
                left: 0,
                grid: [{ rowCount: 1, colCount: 1, toCount: 1, fromCount: 1 }],
              },
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //@ts-ignore
              { priority: 'a' },
              {
                priority: 2,
                width: 1920,
                height: 1080,
                top: 0,
                left: 0,
                grid: [{ rowCount: 1, colCount: 1, toCount: 1, fromCount: 1 }],
              },
            ],
          });
        };
        expect(testFx1).to.throw(TypeError, 'layoutOptions.area[1].priority is not a number');
        expect(testFx2).to.throw(TypeError, 'layoutOptions.area[2].priority is not a number');
      });
      test('Duplicated priority exception', () => {
        const testFx = () => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          createTiler({
            width: 1920,
            height: 1080,
            areas: [
              {
                priority: 0,
                width: 1920,
                height: 1080,
                top: 0,
                left: 0,
                grid: [{ rowCount: 1, colCount: 1, toCount: 1, fromCount: 1 }],
              },
              {
                priority: 0,
                width: 1920,
                height: 1080,
                top: 0,
                left: 0,
                grid: [{ rowCount: 1, colCount: 1, toCount: 1, fromCount: 1 }],
              },
            ],
          });
        };
        expect(testFx).to.throw(TypeError, 'layoutOptions.area[1].priority === 0 already in use');
      });
      suite('Priority validators', () => {
        test('NaN priority must throw exception', () => {
          const testFx = () => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            createTiler({ width: 1920, height: 1080, areas: [{ width: 1920 }] });
          };
          expect(testFx).to.throw(TypeError, 'layoutOptions.area[0].priority is not a number');
        });
      });
      suite('Width validators', () => {
        test('Width === 0 must throw exception', () => {
          const testFx = () => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            createTiler({ width: 1920, height: 1080, areas: [{ priority: 0, width: 0 }] });
          };
          expect(testFx).to.throw(
            TypeError,
            'layoutOptions.area[0].width is not a positive number'
          );
        });
        test('Width < 0 must throw exception', () => {
          const testFx = () => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            createTiler({ width: 1920, height: 1080, areas: [{ priority: 0, width: -2 }] });
          };
          expect(testFx).to.throw(
            TypeError,
            'layoutOptions.area[0].width is not a positive number'
          );
        });
        test('NaN width must throw exception', () => {
          const testFx = () => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            createTiler({ width: 1920, height: 1080, areas: [{ priority: 0, width: 'a' }] });
          };
          expect(testFx).to.throw(
            TypeError,
            'layoutOptions.area[0].width is not a positive number'
          );
        });
      });
      suite('Height validators', () => {
        test('Height === 0 must throw exception', () => {
          const testFx = () => {
            createTiler({
              width: 1920,
              height: 1080,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //@ts-ignore
              areas: [{ priority: 0, width: 1920, height: 0 }],
            });
          };
          expect(testFx).to.throw(
            TypeError,
            'layoutOptions.area[0].height is not a positive number'
          );
        });
        test('Height < 0 must throw exception', () => {
          const testFx = () => {
            createTiler({
              width: 1920,
              height: 1080,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //@ts-ignore
              areas: [{ priority: 0, width: 1920, height: -2 }],
            });
          };
          expect(testFx).to.throw(
            TypeError,
            'layoutOptions.area[0].height is not a positive number'
          );
        });
        test('NaN height must throw exception', () => {
          const testFx = () => {
            createTiler({
              width: 1920,
              height: 1080,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //@ts-ignore
              areas: [{ priority: 0, width: 1920, height: 'a' }],
            });
          };
          expect(testFx).to.throw(
            TypeError,
            'layoutOptions.area[0].height is not a positive number'
          );
        });
      });
      suite('Top validators', () => {
        test('NaN top must throw exception', () => {
          const testFx = () => {
            createTiler({
              width: 1920,
              height: 1080,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //@ts-ignore
              areas: [{ priority: 0, width: 1920, height: 1080, top: 'a' }],
            });
          };
          expect(testFx).to.throw(TypeError, 'layoutOptions.area[0].top is not a number');
        });
        test('Empty top must throw exception', () => {
          const testFx = () => {
            createTiler({
              width: 1920,
              height: 1080,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //@ts-ignore
              areas: [{ priority: 0, width: 1920, height: 1080 }],
            });
          };
          expect(testFx).to.throw(TypeError, 'layoutOptions.area[0].top is not a number');
        });
      });
      suite('Left validators', () => {
        test('NaN left must throw exception', () => {
          const testFx = () => {
            createTiler({
              width: 1920,
              height: 1080,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //@ts-ignore
              areas: [{ priority: 0, width: 1920, height: 1080, top: 0, left: 'a' }],
            });
          };
          expect(testFx).to.throw(TypeError, 'layoutOptions.area[0].left is not a number');
        });
        test('Empty left must throw exception', () => {
          const testFx = () => {
            createTiler({
              width: 1920,
              height: 1080,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //@ts-ignore
              areas: [{ priority: 0, width: 1920, height: 1080, top: 0 }],
            });
          };
          expect(testFx).to.throw(TypeError, 'layoutOptions.area[0].left is not a number');
        });
      });
      suite('Grid validators', () => {
        test('If no grid set must throw exception', () => {
          const testFx = () => {
            createTiler({
              width: 1920,
              height: 1080,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //@ts-ignore
              areas: [{ priority: 0, width: 1920, height: 1080, top: 0, left: 0 }],
            });
          };
          expect(testFx).to.throw(
            TypeError,
            'layoutOptions.area[0].grid have no items. At least one is required.'
          );
        });
        test('Wrong grid set must throw exception', () => {
          const testFx = () => {
            createTiler({
              width: 1920,
              height: 1080,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //@ts-ignore
              areas: [{ priority: 0, width: 1920, height: 1080, top: 0, left: 0, grid: 'a' }],
            });
          };
          expect(testFx).to.throw(
            TypeError,
            'layoutOptions.area[0].grid have no items. At least one is required.'
          );
        });
        test('Empty grid set must throw exception', () => {
          const testFx = () => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            createTiler({
              width: 1920,
              height: 1080,
              areas: [{ priority: 0, width: 1920, height: 1080, top: 0, left: 0, grid: [] }],
            });
          };
          expect(testFx).to.throw(
            TypeError,
            'layoutOptions.area[0].grid have no items. At least one is required.'
          );
        });
        suite('Validate grid content', () => {
          test('Test index in exception', () => {
            const testFx = () => {
              createTiler({
                width: 1920,
                height: 1080,
                areas: [
                  {
                    priority: 0,
                    width: 1920,
                    height: 1080,
                    top: 0,
                    left: 0,
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    //@ts-ignore
                    grid: [{ fromCount: 1, toCount: 1, colCount: 1, rowCount: 1 }, {}],
                  },
                ],
              });
            };
            expect(testFx).to.throw(
              TypeError,
              'layoutOptions.area[0].grid[1].fromCount is not a positive number'
            );
          });
          suite('fromCount validators', () => {
            test('fromCount === 0 must throw exception', () => {
              const testFx = () => {
                createTiler({
                  width: 1920,
                  height: 1080,
                  areas: [
                    {
                      priority: 0,
                      width: 1920,
                      height: 1080,
                      top: 0,
                      left: 0,
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      //@ts-ignore
                      grid: [{ fromCount: 0 }],
                    },
                  ],
                });
              };
              expect(testFx).to.throw(
                TypeError,
                'layoutOptions.area[0].grid[0].fromCount is not a positive number'
              );
            });
            test('fromCount < 0 must throw exception', () => {
              const testFx = () => {
                createTiler({
                  width: 1920,
                  height: 1080,
                  areas: [
                    {
                      priority: 0,
                      width: 1920,
                      height: 1080,
                      top: 0,
                      left: 0,
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      //@ts-ignore
                      grid: [{ fromCount: -1 }],
                    },
                  ],
                });
              };
              expect(testFx).to.throw(
                TypeError,
                'layoutOptions.area[0].grid[0].fromCount is not a positive number'
              );
            });
            test('NaN fromCount must throw exception', () => {
              const testFx = () => {
                createTiler({
                  width: 1920,
                  height: 1080,
                  areas: [
                    {
                      priority: 0,
                      width: 1920,
                      height: 1080,
                      top: 0,
                      left: 0,
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      //@ts-ignore
                      grid: [{ fromCount: 'a' }],
                    },
                  ],
                });
              };
              expect(testFx).to.throw(
                TypeError,
                'layoutOptions.area[0].grid[0].fromCount is not a positive number'
              );
            });
          });
          suite('toCount validators', () => {
            test('toCount === 0 must throw exception', () => {
              const testFx = () => {
                createTiler({
                  width: 1920,
                  height: 1080,
                  areas: [
                    {
                      priority: 0,
                      width: 1920,
                      height: 1080,
                      top: 0,
                      left: 0,
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      //@ts-ignore
                      grid: [{ fromCount: 1, toCount: 0 }],
                    },
                  ],
                });
              };
              expect(testFx).to.throw(
                TypeError,
                'layoutOptions.area[0].grid[0].toCount is not a positive number'
              );
            });
            test('toCount < 0 must throw exception', () => {
              const testFx = () => {
                createTiler({
                  width: 1920,
                  height: 1080,
                  areas: [
                    {
                      priority: 0,
                      width: 1920,
                      height: 1080,
                      top: 0,
                      left: 0,
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      //@ts-ignore
                      grid: [{ fromCount: 1, toCount: -1 }],
                    },
                  ],
                });
              };
              expect(testFx).to.throw(
                TypeError,
                'layoutOptions.area[0].grid[0].toCount is not a positive number'
              );
            });
            test('NaN toCount must throw exception', () => {
              const testFx = () => {
                createTiler({
                  width: 1920,
                  height: 1080,
                  areas: [
                    {
                      priority: 0,
                      width: 1920,
                      height: 1080,
                      top: 0,
                      left: 0,
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      //@ts-ignore
                      grid: [{ fromCount: 1, toCount: 'a' }],
                    },
                  ],
                });
              };
              expect(testFx).to.throw(
                TypeError,
                'layoutOptions.area[0].grid[0].toCount is not a positive number'
              );
            });
          });
          suite('colCount validators', () => {
            test('colCount === 0 must throw exception', () => {
              const testFx = () => {
                createTiler({
                  width: 1920,
                  height: 1080,
                  areas: [
                    {
                      priority: 0,
                      width: 1920,
                      height: 1080,
                      top: 0,
                      left: 0,
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      //@ts-ignore
                      grid: [{ fromCount: 1, toCount: 1, colCount: 0 }],
                    },
                  ],
                });
              };
              expect(testFx).to.throw(
                TypeError,
                'layoutOptions.area[0].grid[0].colCount is not a positive number'
              );
            });
            test('colCount < 0 must throw exception', () => {
              const testFx = () => {
                createTiler({
                  width: 1920,
                  height: 1080,
                  areas: [
                    {
                      priority: 0,
                      width: 1920,
                      height: 1080,
                      top: 0,
                      left: 0,
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      //@ts-ignore
                      grid: [{ fromCount: 1, toCount: 1, colCount: -1 }],
                    },
                  ],
                });
              };
              expect(testFx).to.throw(
                TypeError,
                'layoutOptions.area[0].grid[0].colCount is not a positive number'
              );
            });
            test('NaN colCount must throw exception', () => {
              const testFx = () => {
                createTiler({
                  width: 1920,
                  height: 1080,
                  areas: [
                    {
                      priority: 0,
                      width: 1920,
                      height: 1080,
                      top: 0,
                      left: 0,
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      //@ts-ignore
                      grid: [{ fromCount: 1, toCount: 1, colCount: 'a' }],
                    },
                  ],
                });
              };
              expect(testFx).to.throw(
                TypeError,
                'layoutOptions.area[0].grid[0].colCount is not a positive number'
              );
            });
          });
          suite('rowCount validators', () => {
            test('rowCount === 0 must throw exception', () => {
              const testFx = () => {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                //@ts-ignore
                createTiler({
                  width: 1920,
                  height: 1080,
                  areas: [
                    {
                      priority: 0,
                      width: 1920,
                      height: 1080,
                      top: 0,
                      left: 0,
                      grid: [{ fromCount: 1, toCount: 1, colCount: 1, rowCount: 0 }],
                    },
                  ],
                });
              };
              expect(testFx).to.throw(
                TypeError,
                'layoutOptions.area[0].grid[0].rowCount is not a positive number'
              );
            });
            test('rowCount < 0 must throw exception', () => {
              const testFx = () => {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                //@ts-ignore
                createTiler({
                  width: 1920,
                  height: 1080,
                  areas: [
                    {
                      priority: 0,
                      width: 1920,
                      height: 1080,
                      top: 0,
                      left: 0,
                      grid: [{ fromCount: 1, toCount: 1, colCount: 1, rowCount: -1 }],
                    },
                  ],
                });
              };
              expect(testFx).to.throw(
                TypeError,
                'layoutOptions.area[0].grid[0].rowCount is not a positive number'
              );
            });
            test('NaN rowCount must throw exception', () => {
              const testFx = () => {
                createTiler({
                  width: 1920,
                  height: 1080,
                  areas: [
                    {
                      priority: 0,
                      width: 1920,
                      height: 1080,
                      top: 0,
                      left: 0,
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      //@ts-ignore
                      grid: [{ fromCount: 1, toCount: 1, colCount: 1, rowCount: 'a' }],
                    },
                  ],
                });
              };
              expect(testFx).to.throw(
                TypeError,
                'layoutOptions.area[0].grid[0].rowCount is not a positive number'
              );
            });
          });
        });
      });
    });
  });
});

suite('TilerWorker tests', () => {
  suite('Basic tests', () => {
    test('One area grid9 using test (1 video)');
    test('One area grid9 using test (2 video)');
    test('One area grid9 using test (3 video)');
    test('One area grid9 using test (4 video)');
    test('One area grid9 using test (5 video)');
    test('One area grid9 using test (6 video)');
    test('One area grid9 using test (7 video)');
    test('One area grid9 using test (8 video)');
    test('One area grid9 using test (9 video)');
    test('One area grid9 using test (10 video)');
    test('One area grid9 1000 run test (9 video)');
    test('Multiple area test');
    test('Multiple area test with input priority');
  });
  suite('Area overflow tests', () => {
    test('No overflow');
    test('Next overflow');
    test('Index overflow');
  });
  suite('Padding test', () => {
    test('One area grid9 using test (1 video)');
    test('One area grid9 using test (2 video)');
    test('One area grid9 using test (3 video)');
    test('One area grid9 using test (5 video)');
    test('One area grid9 using test (7 video)');
  });
  test('LTR support');
  suite('Ffmpeg format', () => {
    test('Basic test');
    suite('getTargetMiddleOffset', () => {
      const SMALL_1_TO_2 = { w: 300, h: 600, x: 0, y: 0 };
      const SMALL_2_TO_1 = { w: 600, h: 300, x: 0, y: 0 };
      const SMALL_1_TO_1 = { w: 300, h: 300, x: 0, y: 0 };
      const SMALL_16_TO_9 = { w: 1280, h: 720, x: 0, y: 0 };
      const SMALL_9_TO_16 = { w: 720, h: 1280, x: 0, y: 0 };
      const BIG_1_TO_2 = { w: 960, h: 1920, x: 0, y: 0 };
      const BIG_2_TO_1 = { w: 1920, h: 960, x: 0, y: 0 };
      const BIG_1_TO_1 = { w: 1920, h: 1920, x: 0, y: 0 };
      const BIG_16_TO_9 = { w: 1920, h: 1080, x: 0, y: 0 };
      const BIG_9_TO_16 = { w: 1080, h: 1920, x: 0, y: 0 };
      const mockData = [
        //eql
        { target: SMALL_1_TO_2, source: SMALL_1_TO_2, expectation: [0, 0] },
        { target: SMALL_2_TO_1, source: SMALL_2_TO_1, expectation: [0, 0] },
        { target: SMALL_1_TO_1, source: SMALL_1_TO_1, expectation: [0, 0] },
        { target: SMALL_16_TO_9, source: SMALL_16_TO_9, expectation: [0, 0] },
        { target: SMALL_9_TO_16, source: SMALL_9_TO_16, expectation: [0, 0] },
        { target: BIG_1_TO_2, source: BIG_1_TO_2, expectation: [0, 0] },
        { target: BIG_2_TO_1, source: BIG_2_TO_1, expectation: [0, 0] },
        { target: BIG_1_TO_1, source: BIG_1_TO_1, expectation: [0, 0] },
        { target: BIG_16_TO_9, source: BIG_16_TO_9, expectation: [0, 0] },
        //SMALL_1_TO_2
        { target: SMALL_1_TO_2, source: SMALL_2_TO_1, expectation: [0, 225] }, // 600-150)/2
        { target: SMALL_1_TO_2, source: SMALL_1_TO_1, expectation: [0, 150] }, // 600-300)/2
        { target: SMALL_1_TO_2, source: SMALL_16_TO_9, expectation: [0, 216] }, //
        { target: SMALL_1_TO_2, source: SMALL_9_TO_16, expectation: [0, 33] },
        { target: SMALL_1_TO_2, source: BIG_1_TO_2, expectation: [0, 0] },
        { target: SMALL_1_TO_2, source: BIG_2_TO_1, expectation: [0, 225] },
        { target: SMALL_1_TO_2, source: BIG_1_TO_1, expectation: [0, 150] },
        { target: SMALL_1_TO_2, source: BIG_16_TO_9, expectation: [0, 216] },
        { target: SMALL_1_TO_2, source: BIG_9_TO_16, expectation: [0, 33] },
        //SMALL_2_TO_1
        { target: SMALL_2_TO_1, source: SMALL_1_TO_2, expectation: [225, 0] },
        { target: SMALL_2_TO_1, source: SMALL_1_TO_1, expectation: [150, 0] },
        { target: SMALL_2_TO_1, source: SMALL_16_TO_9, expectation: [33, 0] },
        { target: SMALL_2_TO_1, source: SMALL_9_TO_16, expectation: [216, 0] },
        { target: SMALL_2_TO_1, source: BIG_1_TO_2, expectation: [225, 0] },
        { target: SMALL_2_TO_1, source: BIG_2_TO_1, expectation: [0, 0] },
        { target: SMALL_2_TO_1, source: BIG_1_TO_1, expectation: [150, 0] },
        { target: SMALL_2_TO_1, source: BIG_16_TO_9, expectation: [33, 0] },
        { target: SMALL_2_TO_1, source: BIG_9_TO_16, expectation: [216, 0] },
        //SMALL_1_TO_1
        { target: SMALL_1_TO_1, source: SMALL_1_TO_2, expectation: [75, 0] },
        { target: SMALL_1_TO_1, source: SMALL_2_TO_1, expectation: [0, 75] },
        { target: SMALL_1_TO_1, source: SMALL_16_TO_9, expectation: [0, 66] },
        { target: SMALL_1_TO_1, source: SMALL_9_TO_16, expectation: [66, 0] },
        { target: SMALL_1_TO_1, source: BIG_1_TO_2, expectation: [75, 0] },
        { target: SMALL_1_TO_1, source: BIG_2_TO_1, expectation: [0, 75] },
        { target: SMALL_1_TO_1, source: BIG_1_TO_1, expectation: [0, 0] },
        { target: SMALL_1_TO_1, source: BIG_16_TO_9, expectation: [0, 66] },
        { target: SMALL_1_TO_1, source: BIG_9_TO_16, expectation: [66, 0] },
        //SMALL_16_TO_9
        { target: SMALL_16_TO_9, source: SMALL_1_TO_2, expectation: [460, 0] },
        { target: SMALL_16_TO_9, source: SMALL_2_TO_1, expectation: [0, 40] },
        { target: SMALL_16_TO_9, source: SMALL_1_TO_1, expectation: [280, 0] },
        { target: SMALL_16_TO_9, source: SMALL_9_TO_16, expectation: [437, 0] },
        { target: SMALL_16_TO_9, source: BIG_1_TO_2, expectation: [460, 0] },
        { target: SMALL_16_TO_9, source: BIG_2_TO_1, expectation: [0, 40] },
        { target: SMALL_16_TO_9, source: BIG_1_TO_1, expectation: [280, 0] },
        { target: SMALL_16_TO_9, source: BIG_16_TO_9, expectation: [0, 0] },
        { target: SMALL_16_TO_9, source: BIG_9_TO_16, expectation: [437, 0] },
        //SMALL_9_TO_16
        { target: SMALL_9_TO_16, source: SMALL_1_TO_2, expectation: [40, 0] },
        { target: SMALL_9_TO_16, source: SMALL_2_TO_1, expectation: [0, 460] },
        { target: SMALL_9_TO_16, source: SMALL_1_TO_1, expectation: [0, 280] },
        { target: SMALL_9_TO_16, source: SMALL_16_TO_9, expectation: [0, 437] },
        { target: SMALL_9_TO_16, source: BIG_1_TO_2, expectation: [40, 0] },
        { target: SMALL_9_TO_16, source: BIG_2_TO_1, expectation: [0, 460] },
        { target: SMALL_9_TO_16, source: BIG_1_TO_1, expectation: [0, 280] },
        { target: SMALL_9_TO_16, source: BIG_16_TO_9, expectation: [0, 437] },
        { target: SMALL_9_TO_16, source: BIG_9_TO_16, expectation: [0, 0] },
        //BIG_1_TO_2
        { target: BIG_1_TO_2, source: SMALL_1_TO_2, expectation: [0, 0] },
        { target: BIG_1_TO_2, source: SMALL_2_TO_1, expectation: [0, 720] },
        { target: BIG_1_TO_2, source: SMALL_1_TO_1, expectation: [0, 480] },
        { target: BIG_1_TO_2, source: SMALL_16_TO_9, expectation: [0, 690] },
        { target: BIG_1_TO_2, source: SMALL_9_TO_16, expectation: [0, 107] },
        { target: BIG_1_TO_2, source: BIG_2_TO_1, expectation: [0, 720] },
        { target: BIG_1_TO_2, source: BIG_1_TO_1, expectation: [0, 480] },
        { target: BIG_1_TO_2, source: BIG_16_TO_9, expectation: [0, 690] },
        { target: BIG_1_TO_2, source: BIG_9_TO_16, expectation: [0, 107] },
        //BIG_1_TO_2
        { target: BIG_2_TO_1, source: SMALL_1_TO_2, expectation: [720, 0] },
        { target: BIG_2_TO_1, source: SMALL_2_TO_1, expectation: [0, 0] },
        { target: BIG_2_TO_1, source: SMALL_1_TO_1, expectation: [480, 0] },
        { target: BIG_2_TO_1, source: SMALL_16_TO_9, expectation: [107, 0] },
        { target: BIG_2_TO_1, source: SMALL_9_TO_16, expectation: [690, 0] },
        { target: BIG_2_TO_1, source: BIG_1_TO_2, expectation: [720, 0] },
        { target: BIG_2_TO_1, source: BIG_1_TO_1, expectation: [480, 0] },
        { target: BIG_2_TO_1, source: BIG_16_TO_9, expectation: [107, 0] },
        { target: BIG_2_TO_1, source: BIG_9_TO_16, expectation: [690, 0] },
        //BIG_1_TO_1
        { target: BIG_1_TO_1, source: SMALL_1_TO_2, expectation: [480, 0] },
        { target: BIG_1_TO_1, source: SMALL_2_TO_1, expectation: [0, 480] },
        { target: BIG_1_TO_1, source: SMALL_1_TO_1, expectation: [0, 0] },
        { target: BIG_1_TO_1, source: SMALL_16_TO_9, expectation: [0, 420] },
        { target: BIG_1_TO_1, source: SMALL_9_TO_16, expectation: [420, 0] },
        { target: BIG_1_TO_1, source: BIG_1_TO_2, expectation: [480, 0] },
        { target: BIG_1_TO_1, source: BIG_2_TO_1, expectation: [0, 480] },
        { target: BIG_1_TO_1, source: BIG_16_TO_9, expectation: [0, 420] },
        { target: BIG_1_TO_1, source: BIG_9_TO_16, expectation: [420, 0] },
        //BIG_16_TO_9
        { target: BIG_16_TO_9, source: SMALL_1_TO_2, expectation: [690, 0] },
        { target: BIG_16_TO_9, source: SMALL_2_TO_1, expectation: [0, 60] },
        { target: BIG_16_TO_9, source: SMALL_1_TO_1, expectation: [420, 0] },
        { target: BIG_16_TO_9, source: SMALL_16_TO_9, expectation: [0, 0] },
        { target: BIG_16_TO_9, source: SMALL_9_TO_16, expectation: [656, 0] },
        { target: BIG_16_TO_9, source: BIG_1_TO_2, expectation: [690, 0] },
        { target: BIG_16_TO_9, source: BIG_2_TO_1, expectation: [0, 60] },
        { target: BIG_16_TO_9, source: BIG_1_TO_1, expectation: [420, 0] },
        { target: BIG_16_TO_9, source: BIG_9_TO_16, expectation: [656, 0] },
        //BIG_9_TO_16
        { target: BIG_9_TO_16, source: SMALL_1_TO_2, expectation: [60, 0] },
        { target: BIG_9_TO_16, source: SMALL_2_TO_1, expectation: [0, 690] },
        { target: BIG_9_TO_16, source: SMALL_1_TO_1, expectation: [0, 420] },
        { target: BIG_9_TO_16, source: SMALL_16_TO_9, expectation: [0, 656] },
        { target: BIG_9_TO_16, source: SMALL_9_TO_16, expectation: [0, 0] },
        { target: BIG_9_TO_16, source: BIG_1_TO_2, expectation: [60, 0] },
        { target: BIG_9_TO_16, source: BIG_2_TO_1, expectation: [0, 690] },
        { target: BIG_9_TO_16, source: BIG_1_TO_1, expectation: [0, 420] },
        { target: BIG_9_TO_16, source: BIG_16_TO_9, expectation: [0, 656] },
      ];
      const formatForFfmpegFile = rewire('../src/outputWorkers/formatForFfmpeg/formatForFfmpeg.ts');
      const getTargetMiddleOffset = formatForFfmpegFile.__get__('getTargetMiddleOffset');
      mockData.forEach(({ source, target, expectation }) => {
        test(`Target ${target.w}x${target.h} source ${source.w}x${source.h} expect ${arrFormat(
          expectation
        )}`, () => {
          const result = getTargetMiddleOffset({ target, source });
          expect(result.x).to.be.eq(expectation[0]);
          expect(result.y).to.be.eq(expectation[1]);
        });
      });
      test('X and y target position', () => {
        const result = getTargetMiddleOffset({
          target: { ...BIG_9_TO_16, x: 702, y: 404 },
          source: SMALL_1_TO_2,
        });
        expect(result.x).to.be.eq(762);
        expect(result.y).to.be.eq(404);
      });
    });
    suite('Object fit', () => {
      test('fill');
      test('contain');
      test('cover');
      test('none');
    });
    test('VAD test');
    test('Label position test');
  });
});
