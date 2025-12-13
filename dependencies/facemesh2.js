/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
!(function (t, e) {
    "object" == typeof exports && "undefined" != typeof module
        ? e(exports, require("@tensorflow/tfjs-core"), require("@tensorflow/tfjs-converter"))
        : "function" == typeof define && define.amd
        ? define(["exports", "@tensorflow/tfjs-core", "@tensorflow/tfjs-converter"], e)
        : e(((t = t || self).facemesh = {}), t.tf, t.tf);
})(this, function (t, e, n) {
    "use strict";
    var o = function () {
        return (o =
            Object.assign ||
            function (t) {
                for (var e, n = 1, o = arguments.length; n < o; n++) for (var r in (e = arguments[n])) Object.prototype.hasOwnProperty.call(e, r) && (t[r] = e[r]);
                return t;
            }).apply(this, arguments);
    };
    function r(t, e, n, o) {
        return new (n || (n = Promise))(function (r, i) {
            function s(t) {
                try {
                    c(o.next(t));
                } catch (t) {
                    i(t);
                }
            }
            function a(t) {
                try {
                    c(o.throw(t));
                } catch (t) {
                    i(t);
                }
            }
            function c(t) {
                var e;
                t.done
                    ? r(t.value)
                    : ((e = t.value),
                      e instanceof n
                          ? e
                          : new n(function (t) {
                                t(e);
                            })).then(s, a);
            }
            c((o = o.apply(t, e || [])).next());
        });
    }
    function i(t, e) {
        var n,
            o,
            r,
            i,
            s = {
                label: 0,
                sent: function () {
                    if (1 & r[0]) throw r[1];
                    return r[1];
                },
                trys: [],
                ops: [],
            };
        return (
            (i = { next: a(0), throw: a(1), return: a(2) }),
            "function" == typeof Symbol &&
                (i[Symbol.iterator] = function () {
                    return this;
                }),
            i
        );
        function a(i) {
            return function (a) {
                return (function (i) {
                    if (n) throw new TypeError("Generator is already executing.");
                    for (; s; )
                        try {
                            if (((n = 1), o && (r = 2 & i[0] ? o.return : i[0] ? o.throw || ((r = o.return) && r.call(o), 0) : o.next) && !(r = r.call(o, i[1])).done)) return r;
                            switch (((o = 0), r && (i = [2 & i[0], r.value]), i[0])) {
                                case 0:
                                case 1:
                                    r = i;
                                    break;
                                case 4:
                                    return s.label++, { value: i[1], done: !1 };
                                case 5:
                                    s.label++, (o = i[1]), (i = [0]);
                                    continue;
                                case 7:
                                    (i = s.ops.pop()), s.trys.pop();
                                    continue;
                                default:
                                    if (!((r = s.trys), (r = r.length > 0 && r[r.length - 1]) || (6 !== i[0] && 2 !== i[0]))) {
                                        s = 0;
                                        continue;
                                    }
                                    if (3 === i[0] && (!r || (i[1] > r[0] && i[1] < r[3]))) {
                                        s.label = i[1];
                                        break;
                                    }
                                    if (6 === i[0] && s.label < r[1]) {
                                        (s.label = r[1]), (r = i);
                                        break;
                                    }
                                    if (r && s.label < r[2]) {
                                        (s.label = r[2]), s.ops.push(i);
                                        break;
                                    }
                                    r[2] && s.ops.pop(), s.trys.pop();
                                    continue;
                            }
                            i = e.call(t, s);
                        } catch (t) {
                            (i = [6, t]), (o = 0);
                        } finally {
                            n = r = 0;
                        }
                    if (5 & i[0]) throw i[1];
                    return { value: i[0] ? i[1] : void 0, done: !0 };
                })([i, a]);
            };
        }
    }
    const s = (t) => ({ startEndTensor: t, startPoint: e.slice(t, [0, 0], [-1, 2]), endPoint: e.slice(t, [0, 2], [-1, 2]) }),
        a = { strides: [8, 16], anchors: [2, 6] };
    function c(t, n) {
        let o, r, i;
        if (t.topLeft instanceof e.Tensor && t.bottomRight instanceof e.Tensor) {
            const [s, a] = e.tidy(() => [e.concat([e.sub(n - 1, t.topLeft.slice(0, 1)), t.topLeft.slice(1, 1)]), e.concat([e.sub(n - 1, t.bottomRight.slice(0, 1)), t.bottomRight.slice(1, 1)])]);
            (o = s),
                (r = a),
                null != t.landmarks &&
                    (i = e.tidy(() => {
                        const o = e.sub(e.tensor1d([n - 1, 0]), t.landmarks),
                            r = e.tensor1d([1, -1]);
                        return e.mul(o, r);
                    }));
        } else {
            const [e, s] = t.topLeft,
                [a, c] = t.bottomRight;
            (o = [n - 1 - e, s]), (r = [n - 1 - a, c]), null != t.landmarks && (i = t.landmarks.map((t) => [n - 1 - t[0], t[1]]));
        }
        const s = { topLeft: o, bottomRight: r };
        return null != i && (s.landmarks = i), null != t.probability && (s.probability = t.probability instanceof e.Tensor ? t.probability.clone() : t.probability), s;
    }
    function u(t, n) {
        return e.tidy(() => {
            let o;
            return (
                (o = t.hasOwnProperty("box") ? t.box : t),
                ((t, n) => {
                    const o = e.mul(t.startPoint, n),
                        r = e.mul(t.endPoint, n),
                        i = e.concat2d([o, r], 1);
                    return s(i);
                })(o, n).startEndTensor.squeeze()
            );
        });
    }
    class h {
        constructor(t, n, o, r, i, s) {
            (this.blazeFaceModel = t),
                (this.width = n),
                (this.height = o),
                (this.maxFaces = r),
                (this.anchorsData = (function (t, e, n) {
                    const o = [];
                    for (let r = 0; r < n.strides.length; r++) {
                        const i = n.strides[r],
                            s = Math.floor((e + i - 1) / i),
                            a = Math.floor((t + i - 1) / i),
                            c = n.anchors[r];
                        for (let t = 0; t < s; t++) {
                            const e = i * (t + 0.5);
                            for (let t = 0; t < a; t++) {
                                const n = i * (t + 0.5);
                                for (let t = 0; t < c; t++) o.push([n, e]);
                            }
                        }
                    }
                    return o;
                })(n, o, a)),
                (this.anchors = e.tensor2d(this.anchorsData)),
                (this.inputSizeData = [n, o]),
                (this.inputSize = e.tensor1d([n, o])),
                (this.iouThreshold = i),
                (this.scoreThreshold = s);
        }
        async getBoundingBoxes(t, n, o = !0) {
            const [r, i, a] = e.tidy(() => {
                    const n = t.resizeBilinear([this.width, this.height]),
                        o = e.mul(e.sub(n.div(255), 0.5), 2),
                        r = this.blazeFaceModel.predict(o).squeeze(),
                        i = (function (t, n, o) {
                            const r = e.slice(t, [0, 1], [-1, 2]),
                                i = e.add(r, n),
                                s = e.slice(t, [0, 3], [-1, 2]),
                                a = e.div(s, o),
                                c = e.div(i, o),
                                u = e.div(a, 2),
                                h = e.sub(c, u),
                                l = e.add(c, u),
                                d = e.mul(h, o),
                                f = e.mul(l, o);
                            return e.concat2d([d, f], 1);
                        })(r, this.anchors, this.inputSize),
                        s = e.slice(r, [0, 0], [-1, 1]);
                    return [r, i, e.sigmoid(s).squeeze()];
                }),
                c = console.warn;
            console.warn = () => {};
            const u = e.image.nonMaxSuppression(i, a, this.maxFaces, this.iouThreshold, this.scoreThreshold);
            console.warn = c;
            const h = await u.array();
            u.dispose();
            let l = h.map((t) => e.slice(i, [t, 0], [1, -1]));
            n ||
                (l = await Promise.all(
                    l.map(async (t) => {
                        const e = await t.array();
                        return t.dispose(), e;
                    })
                ));
            const d = t.shape[1],
                f = t.shape[2];
            let p;
            p = n ? e.div([f, d], this.inputSize) : [f / this.inputSizeData[0], d / this.inputSizeData[1]];
            const m = [];
            for (let t = 0; t < l.length; t++) {
                const i = l[t],
                    c = e.tidy(() => {
                        const c = s(i instanceof e.Tensor ? i : e.tensor2d(i));
                        if (!o) return c;
                        const u = h[t];
                        let l;
                        return (l = n ? this.anchors.slice([u, 0], [1, 2]) : this.anchorsData[u]), { box: c, landmarks: e.slice(r, [u, 5], [1, -1]).squeeze().reshape([6, -1]), probability: e.slice(a, [u], [1]), anchor: l };
                    });
                m.push(c);
            }
            return i.dispose(), a.dispose(), r.dispose(), { boxes: m, scaleFactor: p };
        }
        async estimateFaces(t, n = !1, o = !1, r = !0) {
            const [, i] = (function (t) {
                    return t instanceof e.Tensor ? [t.shape[0], t.shape[1]] : [t.height, t.width];
                })(t),
                s = e.tidy(() => (t instanceof e.Tensor || (t = e.browser.fromPixels(t)), t.toFloat().expandDims(0))),
                { boxes: a, scaleFactor: h } = await this.getBoundingBoxes(s, n, r);
            return (
                s.dispose(),
                n
                    ? a.map((t) => {
                          const e = u(t, h);
                          let n = { topLeft: e.slice([0], [2]), bottomRight: e.slice([2], [2]) };
                          if (r) {
                              const { landmarks: e, probability: o, anchor: r } = t,
                                  i = e.add(r).mul(h);
                              (n.landmarks = i), (n.probability = o);
                          }
                          return o && (n = c(n, i)), n;
                      })
                    : Promise.all(
                          a.map(async (t) => {
                              const e = u(t, h);
                              let n;
                              if (r) {
                                  const [o, r, i] = await Promise.all([t.landmarks, e, t.probability].map(async (t) => t.array())),
                                      s = t.anchor,
                                      [a, c] = h,
                                      u = o.map((t) => [(t[0] + s[0]) * a, (t[1] + s[1]) * c]);
                                  (n = { topLeft: r.slice(0, 2), bottomRight: r.slice(2), landmarks: u, probability: i }),
                                      ((t) => {
                                          t.startEndTensor.dispose(), t.startPoint.dispose(), t.endPoint.dispose();
                                      })(t.box),
                                      t.landmarks.dispose(),
                                      t.probability.dispose();
                              } else {
                                  const t = await e.array();
                                  n = { topLeft: t.slice(0, 2), bottomRight: t.slice(2) };
                              }
                              return e.dispose(), o && (n = c(n, i)), n;
                          })
                      )
            );
        }
    }
    async function l({ maxFaces: t = 10, inputWidth: e = 128, inputHeight: o = 128, iouThreshold: r = 0.3, scoreThreshold: i = 0.75 } = {}) {
        const s = await n.loadGraphModel("./dependencies/blazeface", { fromTFHub: !0 });
        return new h(s, e, o, t, r, i);
    }
    var d = {
        silhouette: [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109],
        lipsUpperOuter: [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291],
        lipsLowerOuter: [146, 91, 181, 84, 17, 314, 405, 321, 375, 291],
        lipsUpperInner: [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308],
        lipsLowerInner: [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308],
        rightEyeUpper0: [246, 161, 160, 159, 158, 157, 173],
        rightEyeLower0: [33, 7, 163, 144, 145, 153, 154, 155, 133],
        rightEyeUpper1: [247, 30, 29, 27, 28, 56, 190],
        rightEyeLower1: [130, 25, 110, 24, 23, 22, 26, 112, 243],
        rightEyeUpper2: [113, 225, 224, 223, 222, 221, 189],
        rightEyeLower2: [226, 31, 228, 229, 230, 231, 232, 233, 244],
        rightEyeLower3: [143, 111, 117, 118, 119, 120, 121, 128, 245],
        rightEyebrowUpper: [156, 70, 63, 105, 66, 107, 55, 193],
        rightEyebrowLower: [35, 124, 46, 53, 52, 65],
        leftEyeUpper0: [466, 388, 387, 386, 385, 384, 398],
        leftEyeLower0: [263, 249, 390, 373, 374, 380, 381, 382, 362],
        leftEyeUpper1: [467, 260, 259, 257, 258, 286, 414],
        leftEyeLower1: [359, 255, 339, 254, 253, 252, 256, 341, 463],
        leftEyeUpper2: [342, 445, 444, 443, 442, 441, 413],
        leftEyeLower2: [446, 261, 448, 449, 450, 451, 452, 453, 464],
        leftEyeLower3: [372, 340, 346, 347, 348, 349, 350, 357, 465],
        leftEyebrowUpper: [383, 300, 293, 334, 296, 336, 285, 417],
        leftEyebrowLower: [265, 353, 276, 283, 282, 295],
        midwayBetweenEyes: [168],
        noseTip: [1],
        noseBottom: [2],
        noseRightCorner: [98],
        noseLeftCorner: [327],
        rightCheek: [205],
        leftCheek: [425],
    };
    function f(t) {
        return [Math.abs(t.endPoint[0] - t.startPoint[0]), Math.abs(t.endPoint[1] - t.startPoint[1])];
    }
    function p(t) {
        return [t.startPoint[0] + (t.endPoint[0] - t.startPoint[0]) / 2, t.startPoint[1] + (t.endPoint[1] - t.startPoint[1]) / 2];
    }
    function m(t, e) {
        void 0 === e && (e = 1.5);
        var n = p(t),
            o = f(t),
            r = [(e * o[0]) / 2, (e * o[1]) / 2];
        return { startPoint: [n[0] - r[0], n[1] - r[1]], endPoint: [n[0] + r[0], n[1] + r[1]], landmarks: t.landmarks };
    }
    function b(t, e) {
        var n,
            o = Math.PI / 2 - Math.atan2(-(e[1] - t[1]), e[0] - t[0]);
        return (n = o) - 2 * Math.PI * Math.floor((n + Math.PI) / (2 * Math.PI));
    }
    function g(t, e) {
        return [
            [1, 0, t],
            [0, 1, e],
            [0, 0, 1],
        ];
    }
    function y(t, e) {
        for (var n = 0, o = 0; o < t.length; o++) n += t[o] * e[o];
        return n;
    }
    function P(t, e) {
        for (var n = [], o = 0; o < t.length; o++) n.push(t[o][e]);
        return n;
    }
    function v(t, e) {
        for (var n = [], o = t.length, r = 0; r < o; r++) {
            n.push([]);
            for (var i = 0; i < o; i++) n[r].push(y(t[r], P(e, i)));
        }
        return n;
    }
    function w(t, e) {
        var n = Math.cos(t),
            o = Math.sin(t),
            r = [
                [n, -o, 0],
                [o, n, 0],
                [0, 0, 1],
            ],
            i = v(g(e[0], e[1]), r);
        return v(i, g(-e[0], -e[1]));
    }
    var x = [1, 168],
        M = [3, 2],
        E = (function () {
            function t(t, e, n, o, r, i) {
                (this.regionsOfInterest = []), (this.runsWithoutFaceDetector = 0), (this.boundingBoxDetector = t), (this.meshDetector = e), (this.meshWidth = n), (this.meshHeight = o), (this.maxContinuousChecks = r), (this.maxFaces = i);
            }
            return (
                (t.prototype.transformRawCoords = function (t, e, n, o) {
                    var r,
                        i,
                        s,
                        a,
                        c = this,
                        u = f({ startPoint: e.startPoint, endPoint: e.endPoint }),
                        h = [u[0] / this.meshWidth, u[1] / this.meshHeight],
                        l = t.map(function (t) {
                            return [h[0] * (t[0] - c.meshWidth / 2), h[1] * (t[1] - c.meshHeight / 2), t[2]];
                        }),
                        d = w(n, [0, 0]),
                        m = l.map(function (t) {
                            return (function (t, e) {
                                return [y(t, e[0]), y(t, e[1])];
                            })(t, d).concat([t[2]]);
                        }),
                        b =
                            ((i = [
                                [(r = o)[0][0], r[1][0]],
                                [r[0][1], r[1][1]],
                            ]),
                            (s = [r[0][2], r[1][2]]),
                            (a = [-y(i[0], s), -y(i[1], s)]),
                            [i[0].concat(a[0]), i[1].concat(a[1]), [0, 0, 1]]),
                        g = p({ startPoint: e.startPoint, endPoint: e.endPoint }).concat([1]),
                        P = [y(g, b[0]), y(g, b[1])];
                    return m.map(function (t) {
                        return [t[0] + P[0], t[1] + P[1], t[2]];
                    });
                }),
                (t.prototype.predict = function (t) {
                    return r(this, void 0, void 0, function () {
                        var n,
                            r,
                            s,
                            a,
                            c = this;
                        return i(this, function (i) {
                            switch (i.label) {
                                case 0:
                                    return this.shouldUpdateRegionsOfInterest() ? (!1, !0, [4, this.boundingBoxDetector.getBoundingBoxes(t, !1, !0)]) : [3, 2];
                                case 1:
                                    return (
                                        (n = i.sent()),
                                        (r = n.boxes),
                                        (s = n.scaleFactor),
                                        0 === r.length
                                            ? ((this.regionsOfInterest = []), [2, null])
                                            : ((a = r.map(function (t) {
                                                  var e,
                                                      n,
                                                      r = { startPoint: t.box.startPoint.squeeze().arraySync(), endPoint: t.box.endPoint.squeeze().arraySync() },
                                                      i = m(((n = s), { startPoint: [(e = r).startPoint[0] * n[0], e.startPoint[1] * n[1]], endPoint: [e.endPoint[0] * n[0], e.endPoint[1] * n[1]] }));
                                                  return o({}, i, { landmarks: t.landmarks.arraySync() });
                                              })),
                                              r.forEach(function (t) {
                                                  null != t && null != t.startPoint && (t.startEndTensor.dispose(), t.startPoint.dispose(), t.endPoint.dispose());
                                              }),
                                              this.updateRegionsOfInterest(a),
                                              (this.runsWithoutFaceDetector = 0),
                                              [3, 3])
                                    );
                                case 2:
                                    this.runsWithoutFaceDetector++, (i.label = 3);
                                case 3:
                                    return [
                                        2,
                                        e.tidy(function () {
                                            return c.regionsOfInterest.map(function (n, r) {
                                                var i;
                                                if (468 === n.landmarks.length) {
                                                    var s = x[0],
                                                        a = x[1];
                                                    i = b(n.landmarks[s], n.landmarks[a]);
                                                } else {
                                                    (s = M[0]), (a = M[1]);
                                                    i = b(n.landmarks[s], n.landmarks[a]);
                                                }
                                                var u = p({ startPoint: n.startPoint, endPoint: n.endPoint }),
                                                    h = [u[0] / t.shape[2], u[1] / t.shape[1]],
                                                    l = e.image.rotateWithOffset(t, i, 0, h),
                                                    d = w(-i, u),
                                                    f = (function (t, n, o) {
                                                        var r = n.shape[1],
                                                            i = n.shape[2],
                                                            s = [[t.startPoint[1] / r, t.startPoint[0] / i, t.endPoint[1] / r, t.endPoint[0] / i]];
                                                        return e.image.cropAndResize(n, s, [0], o);
                                                    })({ startPoint: n.startPoint, endPoint: n.endPoint }, l, [c.meshHeight, c.meshWidth]).div(255),
                                                    m = c.meshDetector.predict(f),
                                                    g = m[1],
                                                    y = m[2],
                                                    P = e.reshape(y, [-1, 3]),
                                                    v = P.arraySync(),
                                                    E = c.transformRawCoords(v, n, i, d),
                                                    L = e.tensor2d(E),
                                                    k = c.calculateLandmarksBoundingBox(E);
                                                return (c.regionsOfInterest[r] = o({}, k, { landmarks: L.arraySync() })), { coords: P, scaledCoords: L, box: k, flag: g.squeeze() };
                                            });
                                        }),
                                    ];
                            }
                        });
                    });
                }),
                (t.prototype.updateRegionsOfInterest = function (t) {
                    for (var e = 0; e < t.length; e++) {
                        var n = t[e],
                            o = this.regionsOfInterest[e],
                            r = 0;
                        if (o && o.startPoint) {
                            var i = n.startPoint,
                                s = i[0],
                                a = i[1],
                                c = n.endPoint,
                                u = c[0],
                                h = c[1],
                                l = o.startPoint,
                                d = l[0],
                                f = l[1],
                                p = o.endPoint,
                                m = p[0],
                                b = p[1],
                                g = Math.max(s, d),
                                y = Math.max(a, f),
                                P = (Math.min(u, m) - g) * (Math.min(h, b) - y);
                            r = P / ((u - s) * (h - a) + (m - d) * (b - a) - P);
                        }
                        r < 0.25 && (this.regionsOfInterest[e] = n);
                    }
                    this.regionsOfInterest = this.regionsOfInterest.slice(0, t.length);
                }),
                (t.prototype.clearRegionOfInterest = function (t) {
                    null != this.regionsOfInterest[t] && (this.regionsOfInterest = this.regionsOfInterest.slice(0, t).concat(this.regionsOfInterest.slice(t + 1)));
                }),
                (t.prototype.shouldUpdateRegionsOfInterest = function () {
                    var t = this.regionsOfInterest.length,
                        e = 0 === t;
                    return 1 === this.maxFaces || e ? e : t !== this.maxFaces && this.runsWithoutFaceDetector >= this.maxContinuousChecks;
                }),
                (t.prototype.calculateLandmarksBoundingBox = function (t) {
                    var e = t.map(function (t) {
                            return t[0];
                        }),
                        n = t.map(function (t) {
                            return t[1];
                        }),
                        o = { startPoint: [Math.min.apply(Math, e), Math.min.apply(Math, n)], endPoint: [Math.max.apply(Math, e), Math.max.apply(Math, n)] };
                    return m({ startPoint: o.startPoint, endPoint: o.endPoint });
                }),
                t
            );
        })(),
        L = [
            [0.499976992607117, 0.652534008026123],
            [0.500025987625122, 0.547487020492554],
            [0.499974012374878, 0.602371990680695],
            [0.482113003730774, 0.471979022026062],
            [0.500150978565216, 0.527155995368958],
            [0.499909996986389, 0.498252987861633],
            [0.499523013830185, 0.40106201171875],
            [0.289712011814117, 0.380764007568359],
            [0.499954998493195, 0.312398016452789],
            [0.499987006187439, 0.269918978214264],
            [0.500023007392883, 0.107050001621246],
            [0.500023007392883, 0.666234016418457],
            [0.5000159740448, 0.679224014282227],
            [0.500023007392883, 0.692348003387451],
            [0.499976992607117, 0.695277988910675],
            [0.499976992607117, 0.70593398809433],
            [0.499976992607117, 0.719385027885437],
            [0.499976992607117, 0.737019002437592],
            [0.499967992305756, 0.781370997428894],
            [0.499816000461578, 0.562981009483337],
            [0.473773002624512, 0.573909997940063],
            [0.104906998574734, 0.254140973091125],
            [0.365929991006851, 0.409575998783112],
            [0.338757991790771, 0.41302502155304],
            [0.311120003461838, 0.409460008144379],
            [0.274657994508743, 0.389131009578705],
            [0.393361985683441, 0.403706014156342],
            [0.345234006643295, 0.344011008739471],
            [0.370094001293182, 0.346076011657715],
            [0.319321990013123, 0.347265005111694],
            [0.297903001308441, 0.353591024875641],
            [0.24779200553894, 0.410809993743896],
            [0.396889001131058, 0.842755019664764],
            [0.280097991228104, 0.375599980354309],
            [0.106310002505779, 0.399955987930298],
            [0.2099249958992, 0.391353011131287],
            [0.355807989835739, 0.534406006336212],
            [0.471751004457474, 0.65040397644043],
            [0.474155008792877, 0.680191993713379],
            [0.439785003662109, 0.657229006290436],
            [0.414617002010345, 0.66654098033905],
            [0.450374007225037, 0.680860996246338],
            [0.428770989179611, 0.682690978050232],
            [0.374971002340317, 0.727805018424988],
            [0.486716985702515, 0.547628998756409],
            [0.485300987958908, 0.527395009994507],
            [0.257764995098114, 0.314490020275116],
            [0.401223003864288, 0.455172002315521],
            [0.429818987846375, 0.548614978790283],
            [0.421351999044418, 0.533740997314453],
            [0.276895999908447, 0.532056987285614],
            [0.483370006084442, 0.499586999416351],
            [0.33721199631691, 0.282882988452911],
            [0.296391993761063, 0.293242990970612],
            [0.169294998049736, 0.193813979625702],
            [0.447580009698868, 0.302609980106354],
            [0.392390012741089, 0.353887975215912],
            [0.354490011930466, 0.696784019470215],
            [0.067304998636246, 0.730105042457581],
            [0.442739009857178, 0.572826027870178],
            [0.457098007202148, 0.584792017936707],
            [0.381974011659622, 0.694710969924927],
            [0.392388999462128, 0.694203019142151],
            [0.277076005935669, 0.271932005882263],
            [0.422551989555359, 0.563233017921448],
            [0.385919004678726, 0.281364023685455],
            [0.383103013038635, 0.255840003490448],
            [0.331431001424789, 0.119714021682739],
            [0.229923993349075, 0.232002973556519],
            [0.364500999450684, 0.189113974571228],
            [0.229622006416321, 0.299540996551514],
            [0.173287004232407, 0.278747975826263],
            [0.472878992557526, 0.666198015213013],
            [0.446828007698059, 0.668527007102966],
            [0.422762006521225, 0.673889994621277],
            [0.445307999849319, 0.580065965652466],
            [0.388103008270264, 0.693961024284363],
            [0.403039008378983, 0.706539988517761],
            [0.403629004955292, 0.693953037261963],
            [0.460041999816895, 0.557139039039612],
            [0.431158006191254, 0.692366003990173],
            [0.452181994915009, 0.692366003990173],
            [0.475387006998062, 0.692366003990173],
            [0.465828001499176, 0.779190003871918],
            [0.472328990697861, 0.736225962638855],
            [0.473087012767792, 0.717857003211975],
            [0.473122000694275, 0.704625964164734],
            [0.473033010959625, 0.695277988910675],
            [0.427942007780075, 0.695277988910675],
            [0.426479011774063, 0.703539967536926],
            [0.423162013292313, 0.711845993995667],
            [0.4183090031147, 0.720062971115112],
            [0.390094995498657, 0.639572978019714],
            [0.013953999616206, 0.560034036636353],
            [0.499913990497589, 0.58014702796936],
            [0.413199990987778, 0.69539999961853],
            [0.409626007080078, 0.701822996139526],
            [0.468080013990402, 0.601534962654114],
            [0.422728985548019, 0.585985004901886],
            [0.463079988956451, 0.593783974647522],
            [0.37211999297142, 0.47341400384903],
            [0.334562003612518, 0.496073007583618],
            [0.411671012639999, 0.546965003013611],
            [0.242175996303558, 0.14767599105835],
            [0.290776997804642, 0.201445996761322],
            [0.327338010072708, 0.256527006626129],
            [0.399509996175766, 0.748921036720276],
            [0.441727995872498, 0.261676013469696],
            [0.429764986038208, 0.187834024429321],
            [0.412198007106781, 0.108901023864746],
            [0.288955003023148, 0.398952007293701],
            [0.218936994671822, 0.435410976409912],
            [0.41278201341629, 0.398970007896423],
            [0.257135003805161, 0.355440020561218],
            [0.427684992551804, 0.437960982322693],
            [0.448339998722076, 0.536936044692993],
            [0.178560003638268, 0.45755398273468],
            [0.247308000922203, 0.457193970680237],
            [0.286267012357712, 0.467674970626831],
            [0.332827985286713, 0.460712015628815],
            [0.368755996227264, 0.447206974029541],
            [0.398963987827301, 0.432654976844788],
            [0.476410001516342, 0.405806005001068],
            [0.189241006970406, 0.523923993110657],
            [0.228962004184723, 0.348950982093811],
            [0.490725994110107, 0.562400996685028],
            [0.404670000076294, 0.485132992267609],
            [0.019469000399113, 0.401564002037048],
            [0.426243007183075, 0.420431017875671],
            [0.396993011236191, 0.548797011375427],
            [0.266469985246658, 0.376977026462555],
            [0.439121007919312, 0.51895797252655],
            [0.032313998788595, 0.644356966018677],
            [0.419054001569748, 0.387154996395111],
            [0.462783008813858, 0.505746960639954],
            [0.238978996872902, 0.779744982719421],
            [0.198220998048782, 0.831938028335571],
            [0.107550002634525, 0.540755033493042],
            [0.183610007166862, 0.740257024765015],
            [0.134409993886948, 0.333683013916016],
            [0.385764002799988, 0.883153975009918],
            [0.490967005491257, 0.579378008842468],
            [0.382384985685349, 0.508572995662689],
            [0.174399003386497, 0.397670984268188],
            [0.318785011768341, 0.39623498916626],
            [0.343364000320435, 0.400596976280212],
            [0.396100014448166, 0.710216999053955],
            [0.187885001301765, 0.588537991046906],
            [0.430987000465393, 0.944064974784851],
            [0.318993002176285, 0.898285031318665],
            [0.266247987747192, 0.869701027870178],
            [0.500023007392883, 0.190576016902924],
            [0.499976992607117, 0.954452991485596],
            [0.366169989109039, 0.398822009563446],
            [0.393207013607025, 0.39553701877594],
            [0.410373002290726, 0.391080021858215],
            [0.194993004202843, 0.342101991176605],
            [0.388664990663528, 0.362284004688263],
            [0.365961998701096, 0.355970978736877],
            [0.343364000320435, 0.355356991291046],
            [0.318785011768341, 0.35834002494812],
            [0.301414996385574, 0.363156020641327],
            [0.058132998645306, 0.319076001644135],
            [0.301414996385574, 0.387449026107788],
            [0.499987989664078, 0.618434011936188],
            [0.415838003158569, 0.624195992946625],
            [0.445681989192963, 0.566076993942261],
            [0.465844005346298, 0.620640993118286],
            [0.49992299079895, 0.351523995399475],
            [0.288718998432159, 0.819945991039276],
            [0.335278987884521, 0.852819979190826],
            [0.440512001514435, 0.902418971061707],
            [0.128294005990028, 0.791940987110138],
            [0.408771991729736, 0.373893976211548],
            [0.455606997013092, 0.451801002025604],
            [0.499877005815506, 0.908990025520325],
            [0.375436991453171, 0.924192011356354],
            [0.11421000212431, 0.615022003650665],
            [0.448662012815475, 0.695277988910675],
            [0.4480200111866, 0.704632043838501],
            [0.447111994028091, 0.715808033943176],
            [0.444831997156143, 0.730794012546539],
            [0.430011987686157, 0.766808986663818],
            [0.406787008047104, 0.685672998428345],
            [0.400738000869751, 0.681069016456604],
            [0.392399996519089, 0.677703022956848],
            [0.367855995893478, 0.663918972015381],
            [0.247923001646996, 0.601333022117615],
            [0.452769994735718, 0.420849978923798],
            [0.43639200925827, 0.359887003898621],
            [0.416164010763168, 0.368713974952698],
            [0.413385987281799, 0.692366003990173],
            [0.228018000721931, 0.683571994304657],
            [0.468268007040024, 0.352671027183533],
            [0.411361992359161, 0.804327011108398],
            [0.499989002943039, 0.469825029373169],
            [0.479153990745544, 0.442654013633728],
            [0.499974012374878, 0.439637005329132],
            [0.432112008333206, 0.493588984012604],
            [0.499886006116867, 0.866917014122009],
            [0.49991300702095, 0.821729004383087],
            [0.456548988819122, 0.819200992584229],
            [0.344549000263214, 0.745438992977142],
            [0.37890899181366, 0.574010014533997],
            [0.374292999505997, 0.780184984207153],
            [0.319687992334366, 0.570737957954407],
            [0.357154995203018, 0.604269981384277],
            [0.295284003019333, 0.621580958366394],
            [0.447750002145767, 0.862477004528046],
            [0.410986006259918, 0.508723020553589],
            [0.31395098567009, 0.775308012962341],
            [0.354128003120422, 0.812552988529205],
            [0.324548006057739, 0.703992962837219],
            [0.189096003770828, 0.646299958229065],
            [0.279776990413666, 0.71465802192688],
            [0.1338230073452, 0.682700991630554],
            [0.336768001317978, 0.644733011722565],
            [0.429883986711502, 0.466521978378296],
            [0.455527991056442, 0.548622965812683],
            [0.437114000320435, 0.558896005153656],
            [0.467287987470627, 0.529924988746643],
            [0.414712011814117, 0.335219979286194],
            [0.37704598903656, 0.322777986526489],
            [0.344107985496521, 0.320150971412659],
            [0.312875986099243, 0.32233202457428],
            [0.283526003360748, 0.333190023899078],
            [0.241245999932289, 0.382785975933075],
            [0.102986000478268, 0.468762993812561],
            [0.267612010240555, 0.424560010433197],
            [0.297879010438919, 0.433175981044769],
            [0.333433985710144, 0.433878004550934],
            [0.366427004337311, 0.426115989685059],
            [0.396012008190155, 0.416696012020111],
            [0.420121014118195, 0.41022801399231],
            [0.007561000064015, 0.480777025222778],
            [0.432949006557465, 0.569517970085144],
            [0.458638995885849, 0.479089021682739],
            [0.473466008901596, 0.545744001865387],
            [0.476087987422943, 0.563830018043518],
            [0.468472003936768, 0.555056989192963],
            [0.433990985155106, 0.582361996173859],
            [0.483518004417419, 0.562983989715576],
            [0.482482999563217, 0.57784903049469],
            [0.42645001411438, 0.389798998832703],
            [0.438998997211456, 0.39649498462677],
            [0.450067013502121, 0.400434017181396],
            [0.289712011814117, 0.368252992630005],
            [0.276670008897781, 0.363372981548309],
            [0.517862021923065, 0.471948027610779],
            [0.710287988185883, 0.380764007568359],
            [0.526226997375488, 0.573909997940063],
            [0.895093023777008, 0.254140973091125],
            [0.634069979190826, 0.409575998783112],
            [0.661242008209229, 0.41302502155304],
            [0.688880026340485, 0.409460008144379],
            [0.725341975688934, 0.389131009578705],
            [0.606630027294159, 0.40370500087738],
            [0.654766023159027, 0.344011008739471],
            [0.629905998706818, 0.346076011657715],
            [0.680678009986877, 0.347265005111694],
            [0.702096998691559, 0.353591024875641],
            [0.75221198797226, 0.410804986953735],
            [0.602918028831482, 0.842862963676453],
            [0.719901978969574, 0.375599980354309],
            [0.893692970275879, 0.399959981441498],
            [0.790081977844238, 0.391354024410248],
            [0.643998026847839, 0.534487962722778],
            [0.528249025344849, 0.65040397644043],
            [0.525849997997284, 0.680191040039062],
            [0.560214996337891, 0.657229006290436],
            [0.585384011268616, 0.66654098033905],
            [0.549625992774963, 0.680860996246338],
            [0.57122802734375, 0.682691991329193],
            [0.624852001667023, 0.72809898853302],
            [0.513050019741058, 0.547281980514526],
            [0.51509702205658, 0.527251958847046],
            [0.742246985435486, 0.314507007598877],
            [0.598631024360657, 0.454979002475739],
            [0.570338010787964, 0.548575043678284],
            [0.578631997108459, 0.533622980117798],
            [0.723087012767792, 0.532054007053375],
            [0.516445994377136, 0.499638974666595],
            [0.662801027297974, 0.282917976379395],
            [0.70362401008606, 0.293271005153656],
            [0.830704987049103, 0.193813979625702],
            [0.552385985851288, 0.302568018436432],
            [0.607609987258911, 0.353887975215912],
            [0.645429015159607, 0.696707010269165],
            [0.932694971561432, 0.730105042457581],
            [0.557260990142822, 0.572826027870178],
            [0.542901992797852, 0.584792017936707],
            [0.6180260181427, 0.694710969924927],
            [0.607590973377228, 0.694203019142151],
            [0.722943007946014, 0.271963000297546],
            [0.577413976192474, 0.563166975975037],
            [0.614082992076874, 0.281386971473694],
            [0.616907000541687, 0.255886018276215],
            [0.668509006500244, 0.119913995265961],
            [0.770092010498047, 0.232020974159241],
            [0.635536015033722, 0.189248979091644],
            [0.77039098739624, 0.299556016921997],
            [0.826722025871277, 0.278755009174347],
            [0.527121007442474, 0.666198015213013],
            [0.553171992301941, 0.668527007102966],
            [0.577238023281097, 0.673889994621277],
            [0.554691970348358, 0.580065965652466],
            [0.611896991729736, 0.693961024284363],
            [0.59696102142334, 0.706539988517761],
            [0.596370995044708, 0.693953037261963],
            [0.539958000183105, 0.557139039039612],
            [0.568841993808746, 0.692366003990173],
            [0.547818005084991, 0.692366003990173],
            [0.52461302280426, 0.692366003990173],
            [0.534089982509613, 0.779141008853912],
            [0.527670979499817, 0.736225962638855],
            [0.526912987232208, 0.717857003211975],
            [0.526877999305725, 0.704625964164734],
            [0.526966989040375, 0.695277988910675],
            [0.572058022022247, 0.695277988910675],
            [0.573521018028259, 0.703539967536926],
            [0.57683801651001, 0.711845993995667],
            [0.581691026687622, 0.720062971115112],
            [0.609944999217987, 0.639909982681274],
            [0.986046016216278, 0.560034036636353],
            [0.5867999792099, 0.69539999961853],
            [0.590372025966644, 0.701822996139526],
            [0.531915009021759, 0.601536989212036],
            [0.577268004417419, 0.585934996604919],
            [0.536915004253387, 0.593786001205444],
            [0.627542972564697, 0.473352015018463],
            [0.665585994720459, 0.495950996875763],
            [0.588353991508484, 0.546862006187439],
            [0.757824003696442, 0.14767599105835],
            [0.709249973297119, 0.201507985591888],
            [0.672684013843536, 0.256581008434296],
            [0.600408971309662, 0.74900496006012],
            [0.55826598405838, 0.261672019958496],
            [0.570303976535797, 0.187870979309082],
            [0.588165998458862, 0.109044015407562],
            [0.711045026779175, 0.398952007293701],
            [0.781069993972778, 0.435405015945435],
            [0.587247014045715, 0.398931980133057],
            [0.742869973182678, 0.355445981025696],
            [0.572156012058258, 0.437651991844177],
            [0.55186802148819, 0.536570012569427],
            [0.821442008018494, 0.457556009292603],
            [0.752701997756958, 0.457181990146637],
            [0.71375697851181, 0.467626988887787],
            [0.66711300611496, 0.460672974586487],
            [0.631101012229919, 0.447153985500336],
            [0.6008620262146, 0.432473003864288],
            [0.523481011390686, 0.405627012252808],
            [0.810747981071472, 0.523926019668579],
            [0.771045982837677, 0.348959028720856],
            [0.509127020835876, 0.562718033790588],
            [0.595292985439301, 0.485023975372314],
            [0.980530977249146, 0.401564002037048],
            [0.573499977588654, 0.420000016689301],
            [0.602994978427887, 0.548687994480133],
            [0.733529984951019, 0.376977026462555],
            [0.560611009597778, 0.519016981124878],
            [0.967685997486115, 0.644356966018677],
            [0.580985009670258, 0.387160003185272],
            [0.537728011608124, 0.505385041236877],
            [0.760966002941132, 0.779752969741821],
            [0.801778972148895, 0.831938028335571],
            [0.892440974712372, 0.54076099395752],
            [0.816350996494293, 0.740260004997253],
            [0.865594983100891, 0.333687007427216],
            [0.614073991775513, 0.883246004581451],
            [0.508952975273132, 0.579437971115112],
            [0.617941975593567, 0.508316040039062],
            [0.825608015060425, 0.397674977779388],
            [0.681214988231659, 0.39623498916626],
            [0.656635999679565, 0.400596976280212],
            [0.603900015354156, 0.710216999053955],
            [0.81208598613739, 0.588539004325867],
            [0.56801301240921, 0.944564998149872],
            [0.681007981300354, 0.898285031318665],
            [0.733752012252808, 0.869701027870178],
            [0.633830010890961, 0.398822009563446],
            [0.606792986392975, 0.39553701877594],
            [0.589659988880157, 0.391062021255493],
            [0.805015981197357, 0.342108011245728],
            [0.611334979534149, 0.362284004688263],
            [0.634037971496582, 0.355970978736877],
            [0.656635999679565, 0.355356991291046],
            [0.681214988231659, 0.35834002494812],
            [0.698584973812103, 0.363156020641327],
            [0.941866993904114, 0.319076001644135],
            [0.698584973812103, 0.387449026107788],
            [0.584177017211914, 0.624107003211975],
            [0.554318010807037, 0.566076993942261],
            [0.534153997898102, 0.62064003944397],
            [0.711217999458313, 0.819975018501282],
            [0.664629995822906, 0.852871000766754],
            [0.559099972248077, 0.902631998062134],
            [0.871706008911133, 0.791940987110138],
            [0.591234028339386, 0.373893976211548],
            [0.544341027736664, 0.451583981513977],
            [0.624562978744507, 0.924192011356354],
            [0.88577002286911, 0.615028977394104],
            [0.551338016986847, 0.695277988910675],
            [0.551980018615723, 0.704632043838501],
            [0.552887976169586, 0.715808033943176],
            [0.555167973041534, 0.730794012546539],
            [0.569944024085999, 0.767035007476807],
            [0.593203008174896, 0.685675978660583],
            [0.599261999130249, 0.681069016456604],
            [0.607599973678589, 0.677703022956848],
            [0.631937980651855, 0.663500010967255],
            [0.752032995223999, 0.601315021514893],
            [0.547226011753082, 0.420395016670227],
            [0.563543975353241, 0.359827995300293],
            [0.583841025829315, 0.368713974952698],
            [0.586614012718201, 0.692366003990173],
            [0.771915018558502, 0.683578014373779],
            [0.531597018241882, 0.352482974529266],
            [0.588370978832245, 0.804440975189209],
            [0.52079701423645, 0.442565023899078],
            [0.567984998226166, 0.493479013442993],
            [0.543282985687256, 0.819254994392395],
            [0.655317008495331, 0.745514988899231],
            [0.621008992195129, 0.574018001556396],
            [0.625559985637665, 0.78031200170517],
            [0.680198013782501, 0.570719003677368],
            [0.64276397228241, 0.604337990283966],
            [0.704662978649139, 0.621529996395111],
            [0.552012026309967, 0.862591981887817],
            [0.589071989059448, 0.508637011051178],
            [0.685944974422455, 0.775357007980347],
            [0.645735025405884, 0.812640011310577],
            [0.675342977046967, 0.703978002071381],
            [0.810858011245728, 0.646304965019226],
            [0.72012197971344, 0.714666962623596],
            [0.866151988506317, 0.682704985141754],
            [0.663187026977539, 0.644596993923187],
            [0.570082008838654, 0.466325998306274],
            [0.544561982154846, 0.548375964164734],
            [0.562758982181549, 0.558784961700439],
            [0.531987011432648, 0.530140042304993],
            [0.585271000862122, 0.335177004337311],
            [0.622952997684479, 0.32277899980545],
            [0.655896008014679, 0.320163011550903],
            [0.687132000923157, 0.322345972061157],
            [0.716481983661652, 0.333200991153717],
            [0.758756995201111, 0.382786989212036],
            [0.897013008594513, 0.468769013881683],
            [0.732392013072968, 0.424547016620636],
            [0.70211398601532, 0.433162987232208],
            [0.66652500629425, 0.433866024017334],
            [0.633504986763, 0.426087975502014],
            [0.603875994682312, 0.416586995124817],
            [0.579657971858978, 0.409945011138916],
            [0.992439985275269, 0.480777025222778],
            [0.567192018032074, 0.569419980049133],
            [0.54136598110199, 0.478899002075195],
            [0.526564002037048, 0.546118021011353],
            [0.523913025856018, 0.563830018043518],
            [0.531529009342194, 0.555056989192963],
            [0.566035985946655, 0.582329034805298],
            [0.51631098985672, 0.563053965568542],
            [0.5174720287323, 0.577877044677734],
            [0.573594987392426, 0.389806985855103],
            [0.560697972774506, 0.395331978797913],
            [0.549755990505219, 0.399751007556915],
            [0.710287988185883, 0.368252992630005],
            [0.723330020904541, 0.363372981548309],
        ];
    function k(t, e, n) {
        return r(this, void 0, void 0, function () {
            return i(this, function (o) {
                return [2, l({ maxFaces: t, iouThreshold: e, scoreThreshold: n })];
            });
        });
    }
    function O() {
        return r(this, void 0, void 0, function () {
            return i(this, function (t) {
                return [2, n.loadGraphModel("./dependencies/facemesh", { fromTFHub: !0 })];
            });
        });
    }
    function B(t, n) {
        if (t.mesh instanceof e.Tensor) {
            var o = e.tidy(function () {
                    var o = e.tensor1d([n - 1, 0, 0]),
                        r = e.tensor1d([1, -1, 1]);
                    return e.tidy(function () {
                        return [
                            e.concat([e.sub(n - 1, t.boundingBox.topLeft.slice(0, 1)), t.boundingBox.topLeft.slice(1, 1)]),
                            e.concat([e.sub(n - 1, t.boundingBox.bottomRight.slice(0, 1)), t.boundingBox.bottomRight.slice(1, 1)]),
                            e.sub(o, t.mesh).mul(r),
                            e.sub(o, t.scaledMesh).mul(r),
                        ];
                    });
                }),
                r = o[0],
                i = o[1],
                s = o[2],
                a = o[3];
            return Object.assign({}, t, { boundingBox: { topLeft: r, bottomRight: i }, mesh: s, scaledMesh: a });
        }
        return Object.assign({}, t, {
            boundingBox: { topLeft: [n - 1 - t.boundingBox.topLeft[0], t.boundingBox.topLeft[1]], bottomRight: [n - 1 - t.boundingBox.bottomRight[0], t.boundingBox.bottomRight[1]] },
            mesh: t.mesh.map(function (t) {
                var e = t.slice(0);
                return (e[0] = n - 1 - t[0]), e;
            }),
            scaledMesh: t.scaledMesh.map(function (t) {
                var e = t.slice(0);
                return (e[0] = n - 1 - t[0]), e;
            }),
        });
    }
    var I = (function () {
        function t(t, e, n, o, r) {
            (this.pipeline = new E(t, e, 192, 192, n, r)), (this.detectionConfidence = o);
        }
        return (
            (t.getAnnotations = function () {
                return d;
            }),
            (t.getUVCoords = function () {
                return L;
            }),
            (t.prototype.estimateFaces = function (t, n, o) {
                return (
                    void 0 === n && (n = !1),
                    void 0 === o && (o = !1),
                    r(this, void 0, void 0, function () {
                        var s,
                            a,
                            c,
                            u,
                            h,
                            l = this;
                        return i(this, function (f) {
                            switch (f.label) {
                                case 0:
                                    return (
                                        (s = (function (t) {
                                            return t instanceof e.Tensor ? [t.shape[0], t.shape[1]] : [t.height, t.width];
                                        })(t)),
                                        (a = s[1]),
                                        (c = e.tidy(function () {
                                            return t instanceof e.Tensor || (t = e.browser.fromPixels(t)), t.toFloat().expandDims(0);
                                        })),
                                        "webgl" !== e.getBackend() ? [3, 2] : ((h = e.env().get("WEBGL_PACK_DEPTHWISECONV")), e.env().set("WEBGL_PACK_DEPTHWISECONV", !0), [4, this.pipeline.predict(c)])
                                    );
                                case 1:
                                    return (u = f.sent()), e.env().set("WEBGL_PACK_DEPTHWISECONV", h), [3, 4];
                                case 2:
                                    return [4, this.pipeline.predict(c)];
                                case 3:
                                    (u = f.sent()), (f.label = 4);
                                case 4:
                                    return (
                                        c.dispose(),
                                        null != u && u.length > 0
                                            ? [
                                                  2,
                                                  Promise.all(
                                                      u.map(function (t, s) {
                                                          return r(l, void 0, void 0, function () {
                                                              var c,
                                                                  u,
                                                                  h,
                                                                  l,
                                                                  f,
                                                                  p,
                                                                  m,
                                                                  b,
                                                                  g,
                                                                  y,
                                                                  P,
                                                                  v,
                                                                  w,
                                                                  x,
                                                                  M = this;
                                                              return i(this, function (E) {
                                                                  switch (E.label) {
                                                                      case 0:
                                                                          return (
                                                                              (c = t.coords),
                                                                              (u = t.scaledCoords),
                                                                              (h = t.box),
                                                                              (l = t.flag),
                                                                              (f = [l]),
                                                                              n || (f = f.concat([c, u])),
                                                                              [
                                                                                  4,
                                                                                  Promise.all(
                                                                                      f.map(function (t) {
                                                                                          return r(M, void 0, void 0, function () {
                                                                                              return i(this, function (e) {
                                                                                                  return [2, t.array()];
                                                                                              });
                                                                                          });
                                                                                      })
                                                                                  ),
                                                                              ]
                                                                          );
                                                                      case 1:
                                                                          if (((p = E.sent()), (m = p[0]), l.dispose(), m < this.detectionConfidence && this.pipeline.clearRegionOfInterest(s), n))
                                                                              return (
                                                                                  (b = { faceInViewConfidence: m, mesh: c, scaledMesh: u, boundingBox: { topLeft: e.tensor1d(h.startPoint), bottomRight: e.tensor1d(h.endPoint) } }),
                                                                                  o ? [2, B(b, a)] : [2, b]
                                                                              );
                                                                          for (x in ((g = p.slice(1)),
                                                                          (y = g[0]),
                                                                          (P = g[1]),
                                                                          u.dispose(),
                                                                          c.dispose(),
                                                                          (v = { faceInViewConfidence: m, boundingBox: { topLeft: h.startPoint, bottomRight: h.endPoint }, mesh: y, scaledMesh: P }),
                                                                          o && (v = B(v, a)),
                                                                          (w = {}),
                                                                          d))
                                                                              w[x] = d[x].map(function (t) {
                                                                                  return v.scaledMesh[t];
                                                                              });
                                                                          return (v.annotations = w), [2, v];
                                                                  }
                                                              });
                                                          });
                                                      })
                                                  ),
                                              ]
                                            : [2, []]
                                    );
                            }
                        });
                    })
                );
            }),
            t
        );
    })();
    (t.FaceMesh = I),
        (t.load = function (t) {
            var e = void 0 === t ? {} : t,
                n = e.maxContinuousChecks,
                o = void 0 === n ? 5 : n,
                s = e.detectionConfidence,
                a = void 0 === s ? 0.9 : s,
                c = e.maxFaces,
                u = void 0 === c ? 10 : c,
                h = e.iouThreshold,
                l = void 0 === h ? 0.3 : h,
                d = e.scoreThreshold,
                f = void 0 === d ? 0.75 : d;
            return r(this, void 0, void 0, function () {
                var t, e, n;
                return i(this, function (r) {
                    switch (r.label) {
                        case 0:
                            return [4, Promise.all([k(u, l, f), O()])];
                        case 1:
                            return (t = r.sent()), (e = t[0]), (n = t[1]), [2, new I(e, n, o, a, u)];
                    }
                });
            });
        }),
        Object.defineProperty(t, "__esModule", { value: !0 });
});
