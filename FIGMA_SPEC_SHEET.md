# VedaAI Figma Design Spec Sheet

Extracted dimensions, spacing, colors, and layout specs from the Figma design file "VedaAI - Hiring Assignment" to serve as a reference for implementing pixel-perfect UI components.

---

## 1. Top-Level Container

| Property | Value |
|----------|-------|
| **Frame** | Assignment Creation Flow - Responsive |
| **Width** | 8,743px (contains all screens) |
| **Height** | 3,346px |
| **Border Radius** | 200px |
| **Border** | 1px, #FFFFFF 10% |
| **Background** | #444444 |

---

## 2. Mobile Screens (393px wide)

### 2a. Dashboard (Home - Mobile)
| Property | Value |
|----------|-------|
| **Width** | 393px |
| **Height** | 1,125px |
| **Background** | #CECECE (bg-off white 50%) |

#### Top Nav Bar (Fixed)
| Property | Value |
|----------|-------|
| **Width** | 393px |
| **Height** | 81px |
| **Top** | 105px |
| **Padding** | 18px top/bottom, 20px left/right |
| **Gap** | 12px |
| **Background** | #FFFFFF 1% |
| **Blur** | Background blur (progressive), Start: 96, End: 0 |
| **Scroll position** | Fixed |

#### Scrollable Content (Assignments List)
| Property | Value |
|----------|-------|
| **Width** | 373px (Fixed) |
| **Height** | Hug (818px) |
| **Top** | 190px |
| **Left** | 10px |
| **Gap** | 24px |
| **Flow** | Vertical |

#### Assignment Card
| Property | Value |
|----------|-------|
| **Width** | Fill (373px) |
| **Height** | Hug (116px) |
| **Gap** | 12px |
| **Flow** | Vertical |

### 2b. Dashboard (Assignments View - Mobile)
| Property | Value |
|----------|-------|
| **Width** | 393px |
| **Height** | 2,821px |
| **Background** | #CECECE |

### 2c. Dashboard (Create Assignment - Mobile)
| Property | Value |
|----------|-------|
| **Width** | 393px |
| **Height** | 1,397px |
| **Background** | #CECECE |

### 2d. Dashboard (Form/Detail - Mobile)
| Property | Value |
|----------|-------|
| **Width** | 393px |
| **Height** | 857px |
| **Background** | #CECECE |

---

## 3. Desktop Screens (1,440px wide)

### 3a. 0 State Screen (Empty State)
| Property | Value |
|----------|-------|
| **Width** | 1,440px |
| **Height** | 780px |
| **Background** | Linear Gradient (#EEEEEE -> #DADADA) |

### 3b. Filled State (With Data)
| Property | Value |
|----------|-------|
| **Width** | 1,440px |
| **Height** | 843px |
| **Background** | Linear Gradient (#EEEEEE -> #DADADA) |

### 3c. Upload Material - Selector
| Property | Value |
|----------|-------|
| **Width** | 1,440px |
| **Height** | 1,340px |
| **Background** | Linear Gradient (#EEEEEE -> #DADADA) |

### 3d. Assignment Output
| Property | Value |
|----------|-------|
| **Width** | 1,440px |
| **Height** | 1,715px |
| **Background** | #E6E6E6 |

---

## 4. Desktop Shared Components

### Side Bar
| Property | Value |
|----------|-------|
| **Width** | 304px (Fixed) |
| **Height** | 820px (Fixed) |
| **Top** | 12px |
| **Left** | 12px |
| **Border Radius** | 16px |
| **Justify** | space-between |
| **Padding** | 24px (all sides) |
| **Background** | #FFFFFF |
| **Shadow 1** | X:0, Y:32, Blur:48, Spread:0, #000000 20% |
| **Shadow 2** | X:0, Y:16, Blur:48, Spread:0, #000000 12% |
| **Flow** | Vertical |

### Top Header Bar (Fixed)
| Property | Value |
|----------|-------|
| **Width** | 1,100px (Fixed) |
| **Height** | 56px (Fixed) |
| **Top** | 12px |
| **Left** | 327px |
| **Border Radius** | 16px |
| **Padding** | Left 24px, Right 12px |
| **Gap** | 10px |
| **Background** | #FFFFFF 75% |
| **Scroll position** | Fixed |
| **Flow** | Horizontal |

### Main Content Area
| Property | Value |
|----------|-------|
| **Width** | 1,100px (Fixed) |
| **Height** | Hug (822px) |
| **Top** | 90px |
| **Left** | 327px |
| **Gap** | 12px |
| **Flow** | Vertical |

### Bottom Bar (Fixed)
| Property | Value |
|----------|-------|
| **Width** | 1,125px (Fixed) |
| **Height** | 73px (Fixed) |
| **Top** | 770px |
| **Left** | 315px |
| **Padding** | Top 10px, Bottom 10px |
| **Gap** | 10px |
| **Background** | Linear Gradient (#EAEAEA 0% -> #DADADA) |
| **Blur** | Background blur (progressive), Start: 0, End: 40 |
| **Scroll position** | Fixed |
| **Flow** | Vertical |

### Assignment Row (Desktop - Filled State)
| Property | Value |
|----------|-------|
| **Width** | Fill (1,100px) |
| **Height** | Hug (162px) |
| **Gap** | 16px |
| **Flow** | Horizontal |

---

## 5. Annotation/Notes Section

### Note (Top-Level)
| Property | Value |
|----------|-------|
| **Width** | 1,512px |
| **Height** | 1,019px |
| **Border Radius** | 100px |
| **Border** | 1px, #FFFFFF 10% |
| **Background** | #444444 |

### Note (Inner - within Dashboard)
| Property | Value |
|----------|-------|
| **Width** | 727px |
| **Height** | 243px |

---

## 6. Key Design Tokens

### Colors
| Token | Value | Usage |
|-------|-------|-------|
| Background (desktop) | Linear Gradient #EEEEEE -> #DADADA | Page background |
| Background (mobile) | #CECECE | Mobile screen bg |
| Sidebar bg | #FFFFFF | Sidebar panel |
| Card/Header bg | #FFFFFF 75% | Glass-effect header |
| Nav blur bg | #FFFFFF 1% | Mobile nav blur |
| Assignment Output bg | #E6E6E6 | Output page |
| Dark container | #444444 | Top-level frame, notes |
| Border light | #FFFFFF 10% | Container borders |

### Spacing
| Token | Value | Usage |
|-------|-------|-------|
| Sidebar padding | 24px | All sides |
| Mobile nav padding | 18px top/bottom, 20px left/right | Nav bar |
| Card gap | 12px | Inside assignment cards |
| List gap (mobile) | 24px | Between cards (mobile) |
| List gap (desktop) | 12px | Between rows (desktop) |
| Row item gap | 16px | Between items in a row |
| Header padding | 24px left, 12px right | Top header bar |

### Border Radius
| Element | Radius |
|---------|--------|
| Sidebar | 16px |
| Top Header | 16px |
| Top-level container | 200px |
| Note container | 100px |
