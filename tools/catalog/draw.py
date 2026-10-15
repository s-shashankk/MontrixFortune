"""Flat product illustrations (SVG, 900x700). Each function returns SVG fragments for one product type."""
import math

W, H = 900, 700
FLOOR = 560


def hx(c):
    c = c.lstrip('#')
    return [int(c[i:i + 2], 16) for i in (0, 2, 4)]


def mix(c, t, amt):
    a, b = hx(c), hx(t)
    return '#%02x%02x%02x' % tuple(round(a[i] + (b[i] - a[i]) * amt) for i in range(3))


def dark(c, a=0.25):
    return mix(c, '#000000', a)


def light(c, a=0.25):
    return mix(c, '#ffffff', a)


def R(x, y, w, h, f, rx=0, o=1, s=None, sw=0):
    st = f' stroke="{s}" stroke-width="{sw}"' if s else ''
    return f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" rx="{rx}" fill="{f}" opacity="{o}"{st}/>'


def E(cx, cy, rx, ry, f, o=1, s=None, sw=0):
    st = f' stroke="{s}" stroke-width="{sw}"' if s else ''
    return f'<ellipse cx="{cx:.1f}" cy="{cy:.1f}" rx="{rx:.1f}" ry="{ry:.1f}" fill="{f}" opacity="{o}"{st}/>'


def L(x1, y1, x2, y2, s, w=4, cap='round'):
    return f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{s}" stroke-width="{w}" stroke-linecap="{cap}"/>'


def P(pts, f, o=1):
    return f'<polygon points="{" ".join(f"{x:.1f},{y:.1f}" for x, y in pts)}" fill="{f}" opacity="{o}"/>'


def PATH(d, f='none', s=None, sw=0, o=1):
    st = f' stroke="{s}" stroke-width="{sw}" stroke-linecap="round"' if s else ''
    return f'<path d="{d}" fill="{f}" opacity="{o}"{st}/>'


def shadow(cx, w, y=FLOOR + 14, o=0.18):
    return E(cx, y, w / 2, 16, '#000', o)


# ---------------------------------------------------------------- LIVING
def sofa(c, seats=3, w=640, cx=450):
    x0 = cx - w / 2
    out = [shadow(cx, w + 40)]
    out.append(R(x0 + 30, 300, w - 60, 190, dark(c, .12), 34))            # back
    for i in range(seats):
        sw = (w - 170) / seats
        out.append(R(x0 + 85 + i * sw + 3, 320, sw - 6, 120, light(c, .08), 26))   # back cushions
    out.append(R(x0, 365, 82, 170, dark(c, .05), 30))                      # arms
    out.append(R(x0 + w - 82, 365, 82, 170, dark(c, .05), 30))
    for i in range(seats):
        sw = (w - 170) / seats
        out.append(R(x0 + 82 + i * sw + 2, 440, sw - 4, 70, c, 16))      # seat cushions
    out.append(R(x0 + 20, 505, w - 40, 36, dark(c, .35), 10))
    for lx in (x0 + 40, x0 + w - 60):
        out.append(R(lx, 538, 20, 24, '#3b2a20', 4))
    return out


def sectional(c, cx=450):
    out = [shadow(cx, 760)]
    x0 = cx - 360
    out.append(R(x0 + 30, 300, 560, 190, dark(c, .12), 34))
    for i in range(3):
        out.append(R(x0 + 100 + i * 172, 322, 166, 118, light(c, .08), 26))
    out.append(R(x0, 360, 80, 180, dark(c, .05), 30))
    for i in range(3):
        out.append(R(x0 + 82 + i * 172, 440, 168, 66, c, 16))
    out.append(R(x0 + 20, 505, 560, 36, dark(c, .35), 10))
    # chaise (forward, right)
    out.append(R(x0 + 590, 380, 130, 170, dark(c, .05), 26))
    out.append(R(x0 + 596, 430, 118, 60, c, 16))
    out.append(R(x0 + 590, 490, 130, 56, dark(c, .35), 10))
    for lx in (x0 + 40, x0 + 560, x0 + 690):
        out.append(R(lx, 540, 18, 22, '#3b2a20', 4))
    return out


def armchair(c, recliner=False, cx=450):
    out = [shadow(cx, 420 if recliner else 340)]
    if recliner:
        out.append(R(cx - 170, 250, 250, 260, dark(c, .12), 46))
        out.append(R(cx - 145, 275, 200, 190, light(c, .08), 38))
        out.append(R(cx - 200, 350, 70, 170, dark(c, .05), 28))
        out.append(R(cx + 50, 350, 70, 170, dark(c, .05), 28))
        out.append(R(cx - 130, 440, 180, 62, c, 18))
        out.append(R(cx + 80, 468, 160, 56, dark(c, .1), 24))   # footrest
        out.append(R(cx - 160, 505, 260, 30, dark(c, .35), 10))
        out.append(R(cx - 40, 535, 90, 24, '#222', 8))
    else:
        out.append(R(cx - 140, 300, 280, 200, dark(c, .12), 40))
        out.append(R(cx - 110, 322, 220, 120, light(c, .08), 30))
        out.append(R(cx - 170, 380, 64, 140, dark(c, .05), 26))
        out.append(R(cx + 106, 380, 64, 140, dark(c, .05), 26))
        out.append(R(cx - 108, 440, 216, 60, c, 16))
        out.append(R(cx - 150, 505, 300, 28, dark(c, .35), 10))
        for lx in (cx - 140, cx + 112):
            out.append(R(lx, 530, 22, 32, '#3b2a20', 4))
    return out


def accent_chair(c, cx=450):
    wood = '#9a6b3e'
    out = [shadow(cx, 340)]
    out.append(PATH(f'M{cx-120},460 C{cx-150},300 {cx+150},300 {cx+120},460 Z', c))
    out.append(PATH(f'M{cx-95},455 C{cx-115},335 {cx+115},335 {cx+95},455 Z', light(c, .12)))
    out.append(R(cx - 140, 440, 280, 60, c, 26))
    out.append(R(cx - 150, 490, 300, 24, dark(c, .3), 12))
    out.append(L(cx - 110, 512, cx - 150, 562, wood, 12))
    out.append(L(cx + 110, 512, cx + 150, 562, wood, 12))
    out.append(L(cx - 60, 512, cx - 80, 552, dark(wood, .2), 10))
    out.append(L(cx + 60, 512, cx + 80, 552, dark(wood, .2), 10))
    return out


def coffee_table(c, cx=450, top='#b07a47'):
    out = [shadow(cx, 560)]
    out.append(R(cx - 270, 400, 540, 26, top, 6))
    out.append(R(cx - 270, 426, 540, 12, dark(top, .25), 3))
    for dx in (-240, 214):
        out.append(R(cx + dx, 438, 26, 124, dark(top, .12), 4))
    out.append(R(cx - 220, 500, 440, 14, dark(top, .1), 3))
    return out


def nesting(c, cx=450):
    out = [shadow(cx, 560)]
    out.append(R(cx - 270, 380, 300, 22, c, 6))
    for dx in (-250, 6):
        out.append(R(cx + dx, 402, 20, 160, dark(c, .25), 4))
    out.append(R(cx - 40, 440, 260, 20, light(c, .2), 6))
    for dx in (-20, 184):
        out.append(R(cx + dx, 460, 18, 102, dark(c, .2), 4))
    return out


def tv_unit(c, cx=450):
    out = [shadow(cx, 760)]
    out.append(R(cx - 220, 250, 440, 250 - 70, '#14171c', 10))
    out.append(R(cx - 206, 262, 412, 156, '#2a3340', 6))
    out.append(R(cx - 14, 430, 28, 30, '#222', 3))
    out.append(R(cx - 330, 470, 660, 24, dark(c, .1), 6))
    out.append(R(cx - 330, 494, 660, 70, c, 6))
    for i, dx in enumerate((-325, -110, 105)):
        out.append(R(cx + dx, 500, 205, 56, light(c, .1 if i != 1 else .0), 4))
    out.append(R(cx - 110, 500, 215, 56, dark(c, .35), 4))
    for dx in (-215, 215):
        out.append(R(cx + dx - 25, 520, 50, 6, dark(c, .45), 3))
    out.append(R(cx - 310, 564, 18, 12, '#222', 3))
    out.append(R(cx + 292, 564, 18, 12, '#222', 3))
    return out


def bookshelf(c, cx=450):
    out = [shadow(cx, 420)]
    cols = ['#c0504d', '#4f81bd', '#9bbb59', '#f79646', '#8064a2', '#4bacc6', '#d9b45b']
    out.append(R(cx - 190, 110, 380, 452, dark(c, .1), 6))
    out.append(R(cx - 176, 124, 352, 424, '#efe6da', 3))
    for i in range(5):
        y = 124 + i * 84
        out.append(R(cx - 176, y + 80, 352, 8, c, 2))
        x = cx - 168
        k = 0
        while x < cx + 160:
            bw = 18 + (k * 7 % 14)
            bh = 46 + (k * 11 % 28)
            out.append(R(x, y + 80 - bh, bw, bh, cols[(k + i) % 7], 2))
            x += bw + 3
            k += 1
            if k > 8 + (i % 3):
                break
    return out


def shoe_rack(c, cx=450):
    out = [shadow(cx, 440)]
    out.append(R(cx - 200, 180, 400, 385, dark(c, .15), 8))
    for i in range(3):
        y = 196 + i * 120
        out.append(P([(cx - 188, y), (cx + 188, y), (cx + 176, y + 106), (cx - 176, y + 106)], light(c, .08 * (i + 1))))
        out.append(R(cx - 60, y + 12, 120, 8, dark(c, .45), 4))
    out.append(R(cx - 180, 562, 20, 14, '#222', 3))
    out.append(R(cx + 160, 562, 20, 14, '#222', 3))
    return out


# ---------------------------------------------------------------- BEDROOM
def bed(c, w=620, cx=450, tufted=False, storage=False, single=False):
    wood = c
    out = [shadow(cx, w + 80)]
    x0 = cx - w / 2
    out.append(R(x0 - 10, 210, w + 20, 280, dark(wood, .12), 22))
    if tufted:
        out.append(R(x0 + 14, 226, w - 28, 250, light(wood, .06), 16))
        for r in range(3):
            for k in range(int((w - 80) / 70)):
                out.append(E(x0 + 60 + k * 70, 270 + r * 68, 7, 7, dark(wood, .35)))
    else:
        out.append(R(x0 + 14, 226, w - 28, 250, light(wood, .12), 12))
        for k in range(4):
            out.append(R(x0 + 40 + k * ((w - 120) / 4), 246, (w - 150) / 4, 210, light(wood, .2 + .03 * k), 8, .5))
    out.append(R(x0 - 10, 420, w + 20, 110, wood, 14))
    out.append(R(x0 + 10, 380, w - 20, 70, '#f6f3ee', 22))
    out.append(R(x0 + 10, 440, w - 20, 24, '#e2ddd3', 8))
    pw = (w - 70) / (1 if single else 2)
    out.append(R(x0 + 28, 350, pw - 20, 56, '#ffffff', 22))
    if not single:
        out.append(R(x0 + 28 + pw + 10, 350, pw - 20, 56, '#ffffff', 22))
    out.append(R(x0 + 10, 455, w - 20, 70, dark(wood, .05), 6))
    if storage:
        out.append(R(x0 + 40, 468, w - 80, 14, dark(wood, .4), 7))
        out.append(R(x0 + 40, 492, w - 80, 14, dark(wood, .3), 7, .6))
    out.append(R(x0, 525, 24, 40, dark(wood, .3), 4))
    out.append(R(x0 + w - 24, 525, 24, 40, dark(wood, .3), 4))
    return out


def bunk(c, cx=450):
    out = [shadow(cx, 560)]
    out.append(R(cx - 240, 150, 24, 420, dark(c, .2), 4))
    out.append(R(cx + 216, 150, 24, 420, dark(c, .2), 4))
    for y, col in ((200, '#cfe3f2'), (390, '#f3d9d9')):
        out.append(R(cx - 240, y + 40, 480, 24, c, 4))
        out.append(R(cx - 228, y, 456, 44, col, 14))
        out.append(R(cx - 228, y - 18, 100, 30, '#ffffff', 14))
        out.append(R(cx - 240, y - 52, 480, 10, c, 3))
        for k in range(8):
            out.append(R(cx - 220 + k * 58, y - 52, 8, 52, dark(c, .1), 2))
    out.append(R(cx + 240, 200, 16, 370, dark(c, .35), 3))
    for k in range(7):
        out.append(R(cx + 240, 230 + k * 50, 56, 10, c, 3))
    out.append(R(cx + 280, 200, 16, 370, dark(c, .35), 3))
    return out


def wardrobe(c, doors=3, cx=450, mirror=True):
    w = 150 * doors + 40
    out = [shadow(cx, w + 40)]
    x0 = cx - w / 2
    out.append(R(x0, 100, w, 460, dark(c, .2), 8))
    dw = (w - 28) / doors
    for i in range(doors):
        x = x0 + 14 + i * dw
        mid = (i == doors // 2 and doors == 3 and mirror)
        out.append(R(x + 3, 116, dw - 6, 428, '#bcd6e4' if mid else light(c, .05 + .02 * i), 4))
        if mid:
            out.append(P([(x + 20, 130), (x + 60, 130), (x + 20, 220)], '#ffffff', .5))
            out.append(P([(x + 50, 540), (x + dw - 20, 250), (x + dw - 8, 250), (x + 60, 540)], '#ffffff', .25))
        else:
            out.append(R(x + 14, 136, dw - 34, 388, dark(c, .06), 3, .6))
        hx_ = x + (dw - 14 if i % 2 == 0 else 10)
        out.append(R(hx_ - 2, 300, 6, 70, '#d9d9d9', 3))
    out.append(R(x0 + 10, 558, 24, 14, '#222', 3))
    out.append(R(x0 + w - 34, 558, 24, 14, '#222', 3))
    return out


def dressing(c, cx=450):
    out = [shadow(cx, 480)]
    out.append(E(cx, 230, 120, 150, dark(c, .1)))
    out.append(E(cx, 230, 106, 136, '#cfe0ea'))
    out.append(P([(cx - 70, 130), (cx - 20, 110), (cx - 90, 230)], '#ffffff', .45))
    out.append(R(cx - 230, 380, 460, 26, c, 6))
    out.append(R(cx - 230, 406, 460, 8, dark(c, .25), 2))
    out.append(R(cx - 220, 414, 130, 146, dark(c, .1), 4))
    for k in range(3):
        out.append(R(cx - 212, 420 + k * 47, 114, 42, light(c, .1), 3))
        out.append(R(cx - 170, 436 + k * 47, 30, 6, dark(c, .45), 3))
    out.append(R(cx + 170, 414, 22, 148, dark(c, .2), 4))
    out.append(R(cx - 60, 480, 190, 82, light(c, .1), 6, .0))
    out.append(R(cx - 40, 470, 140, 50, '#a1887f', 18))
    out.append(R(cx - 20, 520, 14, 42, dark(c, .3), 3))
    out.append(R(cx + 66, 520, 14, 42, dark(c, .3), 3))
    return out


def bedside(c, cx=450):
    out = [shadow(cx, 340)]
    out.append(R(cx - 140, 340, 280, 22, dark(c, .1), 5))
    out.append(R(cx - 130, 362, 260, 160, c, 4))
    for k in range(2):
        out.append(R(cx - 118, 372 + k * 72, 236, 64, light(c, .1), 4))
        out.append(R(cx - 24, 396 + k * 72, 48, 8, dark(c, .45), 4))
    for dx in (-120, 100):
        out.append(R(cx + dx, 522, 20, 42, dark(c, .3), 4))
    # little lamp on top
    out.append(PATH(f'M{cx-50},340 L{cx-30},260 L{cx+30},260 L{cx+50},340 Z', '#fff4d6'))
    out.append(R(cx - 8, 340 - 0, 16, 0, '#fff'))
    return out


def chest(c, cx=450):
    out = [shadow(cx, 500)]
    out.append(R(cx - 220, 190, 440, 22, dark(c, .1), 5))
    out.append(R(cx - 210, 212, 420, 340, c, 4))
    for k in range(4):
        out.append(R(cx - 198, 224 + k * 80, 396, 72, light(c, .08 + .02 * k), 4))
        out.append(R(cx - 40, 252 + k * 80, 80, 9, '#d6c7a3', 4))
    for dx in (-200, 176):
        out.append(R(cx + dx, 552, 24, 22, dark(c, .35), 4))
    return out


def bench(c, cx=450):
    out = [shadow(cx, 560)]
    out.append(R(cx - 270, 400, 540, 70, c, 24))
    out.append(R(cx - 270, 450, 540, 24, dark(c, .15), 8))
    for k in range(6):
        out.append(L(cx - 215 + k * 86, 418, cx - 215 + k * 86, 450, dark(c, .25), 3))
    for dx in (-240, 214):
        out.append(R(cx + dx, 474, 26, 88, '#5b3d27', 5))
    return out


# ---------------------------------------------------------------- DINING
def chair_side(x, c, h=1.0, back=True):
    out = []
    if back:
        out.append(R(x, 340, 20, 130, c, 4))
    out.append(R(x - 6, 470, 80, 18, c, 4))
    out.append(R(x - 6, 488, 14, 72, dark(c, .2), 3))
    out.append(R(x + 54, 488, 14, 72, dark(c, .2), 3))
    return out


def dining(c, chairs=6, cx=450, topc=None):
    topc = topc or c
    out = [shadow(cx, 760)]
    tw = 460 if chairs > 4 else 400
    n_back = 3 if chairs > 4 else 2
    # back chairs
    for i in range(n_back):
        x = cx - tw / 2 + 30 + i * (tw - 60) / (n_back) + ((tw - 60) / n_back - 70) / 2
        out.append(R(x, 300, 70, 100, dark(c, .1), 10))
        out.append(R(x + 6, 308, 58, 56, light(c, .1), 8, .8))
    out.append(R(cx - tw / 2 - 20, 410, tw + 40, 22, topc, 6))
    out.append(R(cx - tw / 2, 432, tw, 14, dark(topc, .25), 3))
    for dx in (-tw / 2 + 8, tw / 2 - 36):
        out.append(R(cx + dx, 446, 28, 118, dark(topc, .12), 4))
    # side chairs
    out += chair_side(cx - tw / 2 - 150, c)
    out += chair_side(cx + tw / 2 + 90, c)
    for i in range(n_back):
        x = cx - tw / 2 + 30 + i * (tw - 60) / n_back + ((tw - 60) / n_back - 70) / 2
    # front chairs seats (partially hidden by table)
    for i in range(n_back):
        x = cx - tw / 2 + 30 + i * (tw - 60) / n_back + ((tw - 60) / n_back - 70) / 2
        out.append(R(x + 4, 510, 62, 16, light(c, .05), 5, .9))
        out.append(R(x + 8, 526, 10, 38, dark(c, .25), 3))
        out.append(R(x + 52, 526, 10, 38, dark(c, .25), 3))
    return out


def round_table(c, cx=450, top='#e8e2da'):
    out = [shadow(cx, 560)]
    out.append(E(cx, 420, 250, 56, dark(top, .12)))
    out.append(E(cx, 408, 250, 56, top))
    out.append(R(cx - 30, 430, 60, 110, dark(c, .1), 10))
    out.append(E(cx, 546, 110, 22, c))
    out.append(E(cx, 540, 110, 20, light(c, .15)))
    return out


def dtable(c, cx=450, folding=False):
    out = [shadow(cx, 640)]
    out.append(R(cx - 300, 380, 600, 28, c, 6))
    out.append(R(cx - 288, 408, 576, 18, dark(c, .25), 3))
    for dx in (-278, 244):
        out.append(R(cx + dx, 426, 34, 138, dark(c, .1), 5))
    if folding:
        out.append(L(cx - 150, 426, cx - 70, 520, dark(c, .35), 8))
        out.append(L(cx + 150, 426, cx + 70, 520, dark(c, .35), 8))
        out.append(R(cx - 8, 380, 16, 28, '#bbb', 3))
    return out


def dining_chairs(c, cx=450, pair=True):
    out = [shadow(cx, 620)]
    wood = '#7a5230'
    for off in ((-170, 170) if pair else (0,)):
        x = cx + off
        out.append(R(x - 70, 250, 140, 200, wood, 24))
        out.append(R(x - 56, 264, 112, 172, '#efe0b7', 16))
        for k in range(1, 9):
            out.append(L(x - 56 + k * 12.5, 268, x - 56 + k * 12.5, 432, '#c9b27c', 2))
        for k in range(1, 8):
            out.append(L(x - 54, 264 + k * 21, x + 54, 264 + k * 21, '#c9b27c', 2))
        out.append(R(x - 80, 450, 160, 28, c, 10))
        out.append(L(x - 66, 478, x - 80, 562, wood, 12))
        out.append(L(x + 66, 478, x + 80, 562, wood, 12))
    return out


def bar_stools(c, cx=450):
    out = [shadow(cx, 560)]
    for off in (-140, 140):
        x = cx + off
        out.append(E(x, 330, 70, 18, dark(c, .1)))
        out.append(R(x - 70, 312, 140, 24, c, 12))
        for dx, dx2 in ((-48, -66), (48, 66)):
            out.append(L(x + dx, 340, x + dx2, 560, '#2b2b2b', 9))
        out.append(E(x, 470, 62, 11, 'none', 1, '#2b2b2b', 5))
    return out


def crockery(c, cx=450):
    out = [shadow(cx, 420)]
    out.append(R(cx - 190, 90, 380, 474, dark(c, .1), 8))
    out.append(R(cx - 176, 104, 352, 240, '#e6f0f5', 4))
    for k in range(3):
        y = 104 + k * 80
        out.append(R(cx - 176, y + 74, 352, 6, c, 2))
        for j in range(5):
            out.append(E(cx - 130 + j * 65, y + 58, 22, 6, '#ffffff', 1, '#c9c9c9', 2))
            out.append(E(cx - 130 + j * 65, y + 50, 14, 3, '#f2f2f2'))
    out.append(L(cx, 104, cx, 344, c, 5))
    out.append(R(cx - 176, 350, 352, 200, light(c, .06), 4))
    out.append(L(cx, 350, cx, 550, dark(c, .3), 4))
    out.append(R(cx - 22, 430, 8, 50, '#d6c7a3', 3))
    out.append(R(cx + 14, 430, 8, 50, '#d6c7a3', 3))
    return out


def sideboard(c, cx=450):
    out = [shadow(cx, 760)]
    out.append(R(cx - 340, 360, 680, 26, dark(c, .1), 6))
    out.append(R(cx - 332, 386, 664, 150, c, 4))
    for k in range(4):
        out.append(R(cx - 322 + k * 161, 396, 155, 130, light(c, .08 + .02 * (k % 2)), 3))
        out.append(R(cx - 322 + k * 161 + (130 if k % 2 == 0 else 10), 440, 8, 44, '#d6c7a3', 3))
    for dx in (-310, 280):
        out.append(L(cx + dx + 14, 536, cx + dx + (4 if dx < 0 else 24), 568, '#5b3d27', 10))
    # decor on top
    out.append(E(cx - 230, 330, 22, 34, '#8fb3a1'))
    out.append(R(cx + 190, 300, 70, 60, '#d9c8a0', 4))
    return out


def trolley(c, cx=450):
    out = [shadow(cx, 520)]
    out.append(L(cx - 200, 200, cx - 200, 540, dark(c, .1), 12))
    out.append(L(cx + 200, 200, cx + 200, 540, dark(c, .1), 12))
    out.append(PATH(f'M{cx-200},200 Q{cx},120 {cx+200},200', 'none', dark(c, .1), 12))
    for k, y in enumerate((260, 380, 500)):
        out.append(R(cx - 212, y, 424, 16, c, 4))
        out.append(R(cx - 200, y + 16, 400, 8, dark(c, .35), 2, .5))
    out.append(E(cx - 90, 244, 34, 22, '#d97b66'))
    out.append(R(cx + 50, 212, 90, 48, '#e6e0d0', 6))
    out.append(R(cx - 150, 340, 60, 40, '#7fa6c9', 8))
    out.append(R(cx + 40, 350, 120, 30, '#bfa27a', 6))
    out.append(R(cx - 130, 460, 100, 40, '#c8d6b9', 6))
    for dx in (-190, 190):
        out.append(E(cx + dx, 556, 16, 16, '#222'))
        out.append(E(cx + dx, 556, 6, 6, '#999'))
    return out


# ---------------------------------------------------------------- MATTRESS
def mattress(c, thick=60, layers=3, cx=450, size='78 x 60 in', kid=False, topper=False, spring=False):
    w = 540 if not kid else 440
    d = 130
    x0 = cx - w / 2
    top_y = FLOOR - thick - 4
    out = [shadow(cx, w + 140, FLOOR + 6)]
    face = (dark(c, .06), c)
    th = thick
    # side face (right) + front face + top
    out.append(P([(x0 + w, top_y + 10), (x0 + w + d * .45, top_y - d * .5 + 10), (x0 + w + d * .45, top_y - d * .5 + th + 10), (x0 + w, top_y + th + 10)], dark(c, .22)))
    out.append(R(x0, top_y + 10, w, th, c, 6))
    out.append(P([(x0, top_y + 10), (x0 + d * .45, top_y - d * .5 + 10), (x0 + w + d * .45, top_y - d * .5 + 10), (x0 + w, top_y + 10)], light(c, .35)))
    # quilting on top face
    for k in range(1, 6):
        t = k / 6
        out.append(L(x0 + w * t, top_y + 10, x0 + w * t + d * .45, top_y - d * .5 + 10, light(c, .55), 2))
    for k in range(1, 4):
        t = k / 4
        out.append(L(x0 + d * .45 * t, top_y + 10 - d * .5 * t, x0 + w + d * .45 * t, top_y + 10 - d * .5 * t, light(c, .55), 2))
    # layers on front
    cols = ['#f4efe6', '#7fa6c9', '#e8cfa3', '#cfd8dc']
    lh = (th - 14) / layers
    for i in range(layers):
        col = cols[i % len(cols)] if not topper else '#f4efe6'
        out.append(R(x0 + 8, top_y + 14 + i * lh + 2, w - 16, lh - 2, col, 3, .9))
        if spring and i == layers - 1:
            for k in range(14):
                out.append(E(x0 + 24 + k * (w - 48) / 13, top_y + 14 + i * lh + lh / 2 + 1, 6, lh / 2 - 2, 'none', 1, '#7a7a7a', 2))
    out.append(R(x0, top_y + 10, w, 8, light(c, .2), 4, .8))
    out.append(f'<text x="{cx}" y="{top_y + th + 80}" font-family="Segoe UI, Arial, sans-serif" font-size="26" fill="#55606a" text-anchor="middle" letter-spacing="1">{size}</text>')
    return out


# ---------------------------------------------------------------- DECOR
def floor_lamp(c, cx=450):
    out = [shadow(cx, 260)]
    out.append(E(cx - 120, 558, 90, 14, '#2b2b2b'))
    out.append(PATH(f'M{cx-120},552 L{cx-120},210 C{cx-120},110 {cx+120},100 {cx+130},210', 'none', c, 9))
    out.append(PATH(f'M{cx+80},206 L{cx+180},206 L{cx+210},290 L{cx+50},290 Z', '#fff2cf'))
    out.append(E(cx + 130, 290, 80, 10, '#e9d7a2'))
    out.append(P([(cx + 70, 292), (cx + 190, 292), (cx + 270, 520), (cx - 10, 520)], '#ffe9a8', .16))
    return out


def table_lamp(c, cx=450):
    out = [shadow(cx, 320)]
    out.append(PATH(f'M{cx-110},300 L{cx+110},300 L{cx+70},120 L{cx-70},120 Z', '#fff0cc'))
    out.append(E(cx, 120, 70, 12, '#f2dfaa'))
    out.append(R(cx - 8, 300, 16, 40, '#8a8a8a', 3))
    out.append(PATH(f'M{cx-90},470 C{cx-130},380 {cx-70},340 {cx},340 C{cx+70},340 {cx+130},380 {cx+90},470 C{cx+80},540 {cx-80},540 {cx-90},470 Z', c))
    out.append(E(cx - 40, 400, 14, 40, '#ffffff', .25))
    out.append(R(cx - 70, 536, 140, 24, dark(c, .3), 8))
    return out


def mirror(c, cx=450):
    out = [shadow(cx, 80, FLOOR + 40, .0)]
    out.append(E(cx, 320, 250, 250, c))
    out.append(E(cx, 320, 232, 232, dark(c, .25)))
    out.append(E(cx, 320, 222, 222, '#d7e6ee'))
    out.append(P([(cx - 150, 150), (cx - 70, 110), (cx - 190, 290)], '#ffffff', .55))
    out.append(P([(cx + 30, 520), (cx + 190, 250), (cx + 215, 270), (cx + 70, 530)], '#ffffff', .3))
    out.append(R(cx - 8, 40, 16, 20, c, 3))
    return out


def vases(c, cx=450):
    out = [shadow(cx, 560)]
    out.append(PATH(f'M{cx-180},560 C{cx-250},460 {cx-230},380 {cx-190},340 L{cx-170},250 L{cx-130},250 L{cx-110},340 C{cx-70},380 {cx-60},460 {cx-100},560 Z', c))
    out.append(PATH(f'M{cx-40},560 C{cx-110},470 {cx-90},380 {cx-30},330 C{cx+10},300 {cx+40},300 {cx+60},330 C{cx+120},380 {cx+120},470 {cx+60},560 Z', light(c, .3)))
    out.append(PATH(f'M{cx+120},560 C{cx+100},500 {cx+130},440 {cx+150},400 L{cx+160},340 L{cx+190},340 L{cx+200},400 C{cx+220},440 {cx+250},500 {cx+230},560 Z', dark(c, .15)))
    out.append(L(cx - 150, 250, cx - 190, 150, '#6b8e5a', 5))
    out.append(E(cx - 190, 140, 18, 22, '#e08b9c'))
    out.append(L(cx + 175, 340, cx + 190, 230, '#6b8e5a', 5))
    out.append(E(cx + 190, 220, 16, 20, '#f2c14e'))
    return out


def rug(c, cx=450):
    out = [E(cx, 400, 380, 120, '#000', .12)]
    out.append(P([(cx - 300, 330), (cx + 300, 330), (cx + 400, 500), (cx - 400, 500)], c))
    out.append(P([(cx - 270, 345), (cx + 270, 345), (cx + 350, 485), (cx - 350, 485)], light(c, .18)))
    out.append(P([(cx - 220, 362), (cx + 220, 362), (cx + 290, 470), (cx - 290, 470)], c))
    for k in range(-5, 6):
        out.append(L(cx + k * 38, 365, cx + k * 52, 468, dark(c, .2), 3))
    for k in range(9):
        t = k / 8
        out.append(L(cx - 400 + 100 * (1 - t) * 0 - 4, 500, cx - 400 - 8, 500 + 0, c, 0))
    return out


def wall_art(c, cx=450):
    out = [shadow(cx, 80, FLOOR + 40, .0)]
    pals = [('#264653', '#e9c46a', '#e76f51'), ('#2a9d8f', '#f4a261', '#264653'), ('#e76f51', '#264653', '#e9c46a')]
    for i, dx in enumerate((-290, -95, 100)):
        a, b, d = pals[i]
        out.append(R(cx + dx, 120 + (i % 2) * 20, 190, 400, '#f7f2ea', 4, 1, '#3a2f28', 10))
        out.append(R(cx + dx + 14, 134 + (i % 2) * 20, 162, 372, '#faf6ee'))
        out.append(E(cx + dx + 95, 260 + (i % 2) * 20, 62, 62, a))
        out.append(PATH(f'M{cx+dx+14},470 Q{cx+dx+95},330 {cx+dx+176},470 L{cx+dx+176},506 L{cx+dx+14},506 Z', b))
        out.append(E(cx + dx + 130, 200 + (i % 2) * 20, 22, 22, d))
    return out


def clock(c, cx=450):
    out = [shadow(cx, 80, FLOOR + 40, .0)]
    out.append(E(cx, 320, 250, 250, c))
    out.append(E(cx, 320, 230, 230, '#fbf7ef'))
    for k in range(12):
        a = k * math.pi / 6
        r1, r2 = (190, 215) if k % 3 == 0 else (200, 215)
        out.append(L(cx + r1 * math.sin(a), 320 - r1 * math.cos(a), cx + r2 * math.sin(a), 320 - r2 * math.cos(a), '#3a2f28', 8 if k % 3 == 0 else 4))
    out.append(L(cx, 320, cx + 90 * math.sin(math.radians(300)), 320 - 90 * math.cos(math.radians(300)), '#3a2f28', 12))
    out.append(L(cx, 320, cx + 150 * math.sin(math.radians(60)), 320 - 150 * math.cos(math.radians(60)), '#3a2f28', 8))
    out.append(L(cx, 320, cx + 160 * math.sin(math.radians(180)), 320 - 160 * math.cos(math.radians(180)), '#c0392b', 3))
    out.append(E(cx, 320, 14, 14, '#3a2f28'))
    return out


def cushions(c, cx=450):
    out = [shadow(cx, 700)]
    cols = [c, '#e9c46a', '#2a9d8f', '#e76f51', '#264653']
    pos = [(-300, 400), (-150, 380), (0, 400), (150, 380), (300, 400)]
    for col, (dx, y) in zip(cols, pos):
        x = cx + dx
        out.append(R(x - 85, y - 85, 170, 170, col, 26))
        out.append(R(x - 70, y - 70, 140, 140, light(col, .12), 20))
        out.append(L(x - 70, y - 70, x + 70, y + 70, dark(col, .2), 2))
        out.append(L(x + 70, y - 70, x - 70, y + 70, dark(col, .2), 2))
        out.append(E(x, y, 10, 10, dark(col, .35)))
    return out


def curtains(c, cx=450):
    out = [shadow(cx, 80, FLOOR + 40, .0)]
    out.append(R(cx - 250, 130, 500, 340, '#cde7f3', 4, 1, '#7a6a5a', 10))
    out.append(L(cx, 130, cx, 470, '#7a6a5a', 8))
    out.append(R(cx - 330, 96, 660, 12, '#6b4f3a', 6))
    for dx in (-330, 318):
        out.append(E(cx + dx + 6, 102, 14, 14, '#6b4f3a'))
    for side in (-1, 1):
        x0 = cx - 320 if side < 0 else cx + 100
        for k in range(6):
            out.append(R(x0 + k * 36.6, 108, 34, 450, light(c, .08) if k % 2 else c, 8))
        out.append(P([(x0, 108), (x0 + 36 * 6, 108), (x0 + 36 * 6, 140)], '#000', .0))
    out.append(R(cx - 330, 560, 660, 4, '#000', 0, .0))
    return out


def candles(c, cx=450):
    out = [shadow(cx, 700)]
    out.append(R(cx - 330, 470, 660, 90, '#f4eadc', 10, 1, '#d9c9ad', 3))
    out.append(R(cx - 330, 470, 660, 24, '#e6d6b9', 8))
    cols = [c, '#e9c46a', '#a8c3a0']
    for i, dx in enumerate((-200, 0, 200)):
        x = cx + dx
        out.append(R(x - 78, 330, 156, 140, cols[i], 16))
        out.append(R(x - 78, 330, 156, 28, dark(cols[i], .3), 8))
        out.append(R(x - 60, 372, 120, 60, '#fff', 8, .5))
        out.append(PATH(f'M{x},265 C{x-22},290 {x-14},318 {x},322 C{x+14},318 {x+22},290 {x},265 Z', '#ffb234'))
        out.append(PATH(f'M{x},285 C{x-9},300 {x-6},314 {x},316 C{x+6},314 {x+9},300 {x},285 Z', '#fff2a8'))
        out.append(L(x, 322, x, 332, '#333', 3))
    return out
