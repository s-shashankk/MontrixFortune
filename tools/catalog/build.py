import json, os, re, sys
from draw import *

OUT = sys.argv[1] if len(sys.argv) > 1 else 'out'
os.makedirs(OUT + '/svg', exist_ok=True)

BG = {
    'Living': ('#f3ede4', '#e4d9c8'),
    'Bedroom': ('#eaeef3', '#d6dde7'),
    'Dining': ('#f4ede4', '#e3d5c2'),
    'Mattress': ('#eaf0f4', '#d4e0e9'),
    'Decor': ('#f3ecf0', '#e6d9e0'),
}

# (category, name, description, price INR, stock, drawing lambda)
P_ = []


def add(cat, name, desc, price, stock, fn):
    P_.append(dict(category=cat, name=name, description=desc, price=price, stock=stock, fn=fn))


# ---------------- LIVING
add('Living', 'Oslo 3-Seater Fabric Sofa - Graphite Grey',
    'Three-seater sofa with a solid sheesham wood frame, high-resilience foam cushions and durable textured fabric upholstery. Removable seat cushions, wooden legs. Size: 215 x 88 x 85 cm (L x D x H). Seat height 42 cm.',
    32999, 12, lambda: sofa('#7b8089', 3))
add('Living', 'Milan 2-Seater Velvet Sofa - Emerald Green',
    'Compact two-seater loveseat in soft velvet fabric with a kiln-dried wood frame and high-density foam seating. Ideal for small living rooms and bedrooms. Size: 150 x 82 x 80 cm (L x D x H).',
    24499, 15, lambda: sofa('#1f6f5b', 2, 520))
add('Living', 'Aspen L-Shape Sectional Sofa - Sand Beige',
    'Six-seater L-shape sectional with a reversible chaise, plush foam seating and stain-resistant fabric. Sturdy engineered-wood and pine frame with sheesham legs. Size: 275 x 160 x 85 cm (L x D x H).',
    54999, 8, lambda: sectional('#c9b79c'))
add('Living', 'Nova Single Seater Recliner - Tan',
    'Manual push-back recliner in tan leatherette with a padded headrest and extendable footrest. Hardwood-reinforced frame with high-density foam. Size: 90 x 95 x 100 cm (W x D x H).',
    21999, 14, lambda: armchair('#a8744a', True))
add('Living', 'Cove Accent Chair - Mustard Yellow',
    'Curved-back accent chair with soft velvet fabric, foam-padded seat and solid rubberwood tapered legs. A statement piece for reading corners and bedrooms. Size: 70 x 72 x 78 cm (W x D x H).',
    8999, 20, lambda: accent_chair('#d9a520'))
add('Living', 'Terra Sheesham Wood Coffee Table',
    'Handcrafted coffee table made from solid sheesham wood with a natural honey finish and a lower storage shelf. Size: 100 x 55 x 45 cm (L x W x H).',
    9499, 18, lambda: coffee_table('#b07a47'))
add('Living', 'Zen Nesting Tables - Set of 2',
    'Set of two space-saving nesting tables in engineered wood with a scratch-resistant laminate top and powder-coated legs. Large: 50 x 40 x 50 cm. Small: 38 x 30 x 42 cm.',
    5999, 25, lambda: nesting('#8a6d4f'))
add('Living', 'Vista TV Unit 180 cm - Walnut Finish',
    'Entertainment unit for TVs up to 65 inches with three storage compartments, cable management and soft-close doors. Prelaminated engineered wood in a walnut finish. Size: 180 x 40 x 45 cm (L x D x H).',
    17999, 16, lambda: tv_unit('#6b4a33'))
add('Living', 'Arden 5-Tier Bookshelf - Walnut',
    'Five-tier open bookshelf with sturdy engineered-wood shelves (10 kg per shelf) and an anti-tip wall fixing. Size: 80 x 30 x 180 cm (W x D x H).',
    7499, 22, lambda: bookshelf('#6b4a33'))
add('Living', 'Pico Shoe Rack Cabinet - 3 Flip Drawers',
    'Slim shoe cabinet with three flip-down compartments holding up to 12 pairs. Engineered wood with a matte finish. Size: 80 x 24 x 100 cm (W x D x H).',
    4999, 30, lambda: shoe_rack('#7c8a96'))

# ---------------- BEDROOM
add('Bedroom', 'Regal King Size Bed with Box Storage - Sheesham',
    'King size bed in solid sheesham wood with a carved headboard and hydraulic box storage. Fits a 78 x 72 inch mattress (sold separately). Size: 195 x 215 x 100 cm (W x L x H).',
    38999, 7, lambda: bed('#8a5a35', 660, storage=True))
add('Bedroom', 'Luna Queen Size Upholstered Bed - Slate Grey',
    'Queen size bed with a tufted upholstered headboard, solid wood frame and slat base. Fits a 78 x 60 inch mattress (sold separately). Size: 165 x 210 x 110 cm (W x L x H).',
    29999, 10, lambda: bed('#6f7782', 600, tufted=True))
add('Bedroom', 'Haven Single Bed - Walnut Finish',
    'Single bed in engineered wood with a clean-line headboard and sturdy slats. Fits a 75 x 36 inch mattress (sold separately). Size: 100 x 205 x 85 cm (W x L x H).',
    12499, 18, lambda: bed('#6b4a33', 420, single=True))
add('Bedroom', 'Aria 3-Door Wardrobe with Mirror',
    'Spacious three-door wardrobe with a full-length mirror, two hanging sections, four shelves and a locker drawer. Engineered wood with a lacquered finish. Size: 150 x 52 x 200 cm (W x D x H).',
    27999, 9, lambda: wardrobe('#8d7058', 3))
add('Bedroom', 'Cedar 2-Door Wardrobe - Rustic Oak',
    'Two-door wardrobe with a hanging rod, three shelves and a bottom drawer. Prelaminated engineered wood. Size: 100 x 50 x 180 cm (W x D x H).',
    16999, 13, lambda: wardrobe('#a58461', 2))
add('Bedroom', 'Slate Dressing Table with Mirror and Stool',
    'Dressing table with a framed oval mirror, three drawers and a cushioned stool. Engineered wood with a matte finish. Size: 90 x 40 x 150 cm (W x D x H, with mirror).',
    11999, 14, lambda: dressing('#5d6770'))
add('Bedroom', 'Pearl Bedside Table with 2 Drawers',
    'Bedside table with two soft-close drawers and a flat top for a lamp and phone. Engineered wood with a walnut finish. Size: 45 x 40 x 55 cm (W x D x H).',
    3999, 28, lambda: bedside('#7a5a40'))
add('Bedroom', 'Willow Chest of 4 Drawers',
    'Four-drawer chest with smooth-glide runners and metal handles for clothes and linen. Engineered wood. Size: 75 x 40 x 105 cm (W x D x H).',
    13499, 11, lambda: chest('#9a8167'))
add('Bedroom', 'Nest Bunk Bed with Ladder and Safety Rails',
    'Sturdy bunk bed in pine wood with a side ladder and full safety rails. Fits two 75 x 36 inch mattresses (sold separately). Size: 105 x 205 x 160 cm (W x L x H).',
    26999, 6, lambda: bunk('#b98c5a'))
add('Bedroom', 'Alder Upholstered Bed-End Bench',
    'Bench for the foot of the bed with a tufted fabric top, foam padding and solid wood legs. Size: 110 x 40 x 45 cm (L x D x H).',
    6999, 17, lambda: bench('#b99d85'))

# ---------------- DINING
add('Dining', 'Kaveri 6-Seater Sheesham Dining Set',
    'Complete dining set: solid sheesham wood table with six cushioned chairs. Natural honey finish, seats six comfortably. Table size: 180 x 90 x 76 cm (L x W x H).',
    58999, 5, lambda: dining('#8a5a35', 6))
add('Dining', 'Mira 4-Seater Dining Set - Walnut',
    'Four-seater dining set with a rectangular table and four chairs with cushioned seats. Rubberwood and engineered wood in walnut finish. Table size: 120 x 75 x 76 cm (L x W x H).',
    32999, 9, lambda: dining('#6b4a33', 4))
add('Dining', 'Orion Round 4-Seater Dining Table - Marble Top',
    'Round pedestal dining table with a marble-look tempered-glass top and metal base. Seats four. Size: 105 cm diameter x 76 cm height.',
    27999, 7, lambda: round_table('#b88a44', top='#ece7df'))
add('Dining', 'Vedic 6-Seater Dining Table - Solid Wood',
    'Table only, in solid mango wood with a scratch-resistant finish. Seats six. Size: 165 x 90 x 76 cm (L x W x H).',
    36999, 8, lambda: dtable('#9a6b3e'))
add('Dining', 'Cane Back Dining Chairs - Set of 2',
    'Pair of dining chairs with woven cane backs, padded seats and solid rubberwood legs. Size (each): 45 x 50 x 90 cm (W x D x H).',
    8999, 24, lambda: dining_chairs('#c9a77a'))
add('Dining', 'Bistro Bar Stools - Set of 2',
    'Pair of bar stools with cushioned seats, footrest rings and sturdy iron frames. Seat height 75 cm. Great for kitchen counters.',
    7499, 20, lambda: bar_stools('#8c5a3c'))
add('Dining', 'Dahlia Crockery Cabinet with Glass Doors',
    'Tall crockery unit with glass upper doors, adjustable shelves and a closed lower storage section. Engineered wood. Size: 90 x 38 x 180 cm (W x D x H).',
    21999, 6, lambda: crockery('#7b5a3e'))
add('Dining', 'Marlo 4-Door Sideboard - Teak Finish',
    'Four-door sideboard for crockery and serveware with fixed shelves and metal handles. Engineered wood with a teak finish. Size: 150 x 40 x 80 cm (L x D x H).',
    24999, 8, lambda: sideboard('#9a6b3e'))
add('Dining', 'Foldo Folding Dining Table - 4 Seater',
    'Drop-leaf folding table that opens to seat four and folds flat to save space. Engineered wood with a scratch-resistant top. Size (open): 120 x 70 x 75 cm.',
    12999, 16, lambda: dtable('#b08a5c', folding=True))
add('Dining', 'Rolla Kitchen Trolley - 3 Tier',
    'Three-tier rolling trolley with lockable wheels and a sturdy handle for kitchen storage and serving. Powder-coated iron with wood shelves. Size: 50 x 35 x 85 cm.',
    6499, 25, lambda: trolley('#4d4d52'))

# ---------------- MATTRESS
add('Mattress', 'Montrix Comfort Foam Mattress - Single (75 x 36 x 5 in)',
    'Five-inch high-density foam mattress with a quilted breathable cover. Medium-firm support for everyday use. Size: 75 x 36 x 5 inches. 5-year warranty.',
    5499, 30, lambda: mattress('#9cb6c9', 56, 2, size='75 x 36 x 5 in'))
add('Mattress', 'Montrix Orthopedic Memory Foam Mattress - Queen (78 x 60 x 6 in)',
    'Six-inch memory foam mattress with an orthopedic support base for back-pain relief. Pressure-relieving, with a removable washable cover. Size: 78 x 60 x 6 inches. 7-year warranty.',
    17999, 14, lambda: mattress('#8fa9bd', 68, 3, size='78 x 60 x 6 in'))
add('Mattress', 'Montrix Pocket Spring Mattress - King (78 x 72 x 8 in)',
    'Eight-inch pocket spring mattress with a foam comfort layer. Individually wrapped springs reduce motion transfer for couples. Size: 78 x 72 x 8 inches. 10-year warranty.',
    28999, 9, lambda: mattress('#a9a2b8', 86, 3, size='78 x 72 x 8 in', spring=True))
add('Mattress', 'Montrix Dual Comfort Mattress - Queen (78 x 60 x 8 in)',
    'Reversible mattress: a firm side for back support and a soft side for comfort. Eight-inch foam construction. Size: 78 x 60 x 8 inches. 8-year warranty.',
    14499, 12, lambda: mattress('#b7a58f', 86, 3, size='78 x 60 x 8 in'))
add('Mattress', 'Montrix Bonnell Spring Mattress - Double (75 x 48 x 6 in)',
    'Six-inch bonnell spring mattress with a firm, even surface and a durable knitted cover. Size: 75 x 48 x 6 inches. 5-year warranty.',
    11999, 15, lambda: mattress('#8aa88f', 68, 3, size='75 x 48 x 6 in', spring=True))
add('Mattress', 'Montrix Latex Hybrid Mattress - King (78 x 72 x 10 in)',
    'Ten-inch hybrid mattress combining natural latex, pocket springs and a cooling cover. Premium comfort with strong edge support. Size: 78 x 72 x 10 inches. 10-year warranty.',
    42999, 6, lambda: mattress('#c4b08a', 104, 4, size='78 x 72 x 10 in', spring=True))
add('Mattress', 'Montrix Kids Foam Mattress - Single (72 x 30 x 4 in)',
    'Four-inch firm foam mattress sized for kids, with a hypoallergenic, waterproof-backed cover. Size: 72 x 30 x 4 inches. 3-year warranty.',
    3999, 24, lambda: mattress('#e0a3a3', 46, 2, size='72 x 30 x 4 in', kid=True))
add('Mattress', 'Montrix Cooling Gel Memory Foam Mattress - King (78 x 72 x 8 in)',
    'Eight-inch memory foam mattress infused with cooling gel for hot sleepers, with a breathable cover. Size: 78 x 72 x 8 inches. 10-year warranty.',
    33999, 8, lambda: mattress('#7fb8c4', 86, 3, size='78 x 72 x 8 in'))
add('Mattress', 'Montrix Coir Mattress - Double (75 x 48 x 5 in)',
    'Firm coir mattress with a rubberised coir core, natural and breathable. Good for those who prefer a hard surface. Size: 75 x 48 x 5 inches. 3-year warranty.',
    8499, 18, lambda: mattress('#a8946f', 56, 2, size='75 x 48 x 5 in'))
add('Mattress', 'Montrix Memory Foam Mattress Topper - Queen (78 x 60 x 2 in)',
    'Two-inch memory foam topper that adds cushioning to a firm mattress. Anchor straps keep it in place. Size: 78 x 60 x 2 inches. 2-year warranty.',
    4999, 26, lambda: mattress('#c2d3de', 28, 1, size='78 x 60 x 2 in', topper=True))

# ---------------- DECOR
add('Decor', 'Arc Floor Lamp - Brass Finish',
    'Arc floor lamp with a metal stand in brass finish, a linen drum shade and a weighted base. E27 holder (bulb not included). Height: 170 cm.',
    4999, 20, lambda: floor_lamp('#b8903c'))
add('Decor', 'Ceramic Table Lamp - Teal',
    'Handmade ceramic base table lamp with a cotton shade. E27 holder (bulb not included). Height: 45 cm.',
    1999, 35, lambda: table_lamp('#2f8c8a'))
add('Decor', 'Round Wall Mirror 60 cm - Gold Frame',
    'Round decorative mirror with a slim metal frame in gold finish. Easy hanging hook included. Diameter: 60 cm.',
    3499, 22, lambda: mirror('#c9a24a'))
add('Decor', 'Ceramic Vase Set of 3 - Sage Green',
    'Set of three hand-glazed ceramic vases in different heights, in sage green. Heights: 15 cm, 20 cm and 25 cm.',
    1799, 40, lambda: vases('#8aa68b'))
add('Decor', 'Handwoven Jute Area Rug 5 x 7 ft',
    'Natural jute rug, handwoven by artisans, with a braided pattern. Durable and eco-friendly. Size: 5 x 7 feet (152 x 213 cm).',
    4299, 15, lambda: rug('#c9ab78'))
add('Decor', 'Abstract Canvas Wall Art - Set of 3',
    'Set of three framed abstract canvas prints, ready to hang. Each panel: 30 x 60 cm.',
    2999, 18, lambda: wall_art('#264653'))
add('Decor', 'Wooden Wall Clock 24 Inch - Silent Sweep',
    'Large 24-inch wall clock with a wooden frame and a silent sweep movement. Requires 1 AA battery (not included).',
    1599, 28, lambda: clock('#8a5a35'))
add('Decor', 'Cotton Cushion Covers 16 x 16 in - Set of 5',
    'Set of five cotton cushion covers with a concealed zip. Machine washable. Size: 16 x 16 inches (40 x 40 cm). Inserts not included.',
    999, 60, lambda: cushions('#c0504d'))
add('Decor', 'Blackout Curtains 7 ft - Pair (Eyelet)',
    'Pair of thermal blackout curtains with eyelets for easy hanging. Blocks light and reduces noise. Size: 4.5 ft wide x 7 ft drop each.',
    1899, 32, lambda: curtains('#6e7f96'))
add('Decor', 'Scented Soy Candle Gift Set - 3 Jars',
    'Gift box of three soy wax scented candles in glass jars: lavender, vanilla and sandalwood. Burn time about 25 hours each.',
    799, 45, lambda: candles('#b78fb3'))


def slug(n):
    return re.sub(r'[^a-z0-9]+', '-', n.lower()).strip('-')


ZOOM = {
 'Oslo':1.25,'Milan':1.35,'Aspen':1.1,'Nova':1.4,'Cove':1.5,'Terra':1.3,'Zen Nesting':1.35,'Vista':1.15,'Arden':1.1,'Pico':1.35,
 'Regal':1.15,'Luna':1.2,'Haven':1.5,'Aria':1.1,'Cedar':1.15,'Slate Dressing':1.05,'Pearl':1.6,'Willow':1.15,'Nest':1.05,'Alder':1.3,
 'Kaveri':1.0,'Mira':1.1,'Orion':1.5,'Vedic':1.3,'Cane':1.2,'Bistro':1.4,'Dahlia':1.1,'Marlo':1.15,'Foldo':1.3,'Rolla':1.15,
 'Arc Floor':1.1,'Ceramic Table':1.1,'Ceramic Vase':1.2,'Cotton':1.0,'Scented':1.1,
}
def zoom(name):
    for k,v in ZOOM.items():
        if name.startswith(k): return v,0
    if name.startswith('Montrix'): return 1.25,0
    return 1.0,0

def svg_doc(cat, inner, z=1.0, dy=0):
    top, bot = BG[cat]
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">'
            f'<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{top}"/><stop offset="1" stop-color="{bot}"/></linearGradient></defs>'
            f'<rect width="{W}" height="{H}" fill="url(#bg)"/>'
            f'<rect y="{FLOOR + 6}" width="{W}" height="{H - FLOOR - 6}" fill="#000" opacity="0.045"/>'
            + f'<g transform="translate(0 {dy}) translate(450 {FLOOR}) scale({z}) translate(-450 -{FLOOR})">' + ''.join(inner) + '</g></svg>')


catalog = []
for p in P_:
    s = slug(p['name'])
    open(f'{OUT}/svg/{s}.svg', 'w', encoding='utf-8').write(svg_doc(p['category'], p['fn'](), *zoom(p['name'])))
    catalog.append(dict(category=p['category'], name=p['name'], description=p['description'], price=p['price'],
                        stockQuantity=p['stock'], imageUrl=f'/products/{s}.svg'))
json.dump(catalog, open(f'{OUT}/products.json', 'w', encoding='utf-8'), indent=2, ensure_ascii=False)
print(len(catalog), 'products', {c: sum(1 for x in catalog if x['category'] == c) for c in BG})
assert max(len(x['description']) for x in catalog) < 1000
assert len({x['name'] for x in catalog}) == len(catalog)
