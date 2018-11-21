# datagrid.scroll
horizontal and vertical scrolling of ublabloo/datagrid. Table header fixed on vertical scrolling
# Features
- vertical scrolling. Only table body is scrolled. table header is fixed
- horizontal scrolling. Header is iscrolled synchronously with table body
- settings and groups actions are not scrolled
- paging is not scrolled
- white space wrapping is off
# How it is done
- ublabloo/datagrid table header is hidden
- ublabloo/datagrid group actions a settings are mirrored into a non-scrollable div (settings div). This div doesn't scroll neither horizontaly nor vertically.
- ublabloo/datagrid column names and filters are mirrored into a new table (header table). This table scrolls synchronously with table body.
- ublabloo/datagrid paging is mirrored into a new paging (paging div). This div doesn't scroll neither horizontaly nor vertically.
- clicks and key pressings are mirrored so original ublabloo/datagrid links and inputs receive appropriate events
# It's easy to use
```html
<link rel="stylesheet" type="text/css" href="../bower_components/ublaboo-datagrid/assets/dist/datagrid.css">
<link rel="stylesheet" href="{$basePath}/css/datagrid.scroll.css" type="text/css" />
```

```html
<script src="../bower_components/ublaboo-datagrid/assets/dist/datagrid.js"></script>
<script src="{$basePath}/js/datagrid.scroll.js" type="text/javascript"></script>
```

```javascript
$.nette.init();
//
// this functions adds scrolling to grid with component name 'objednavkaDatagrid'
// - horizontal scrolling will be added if table width exceeds window width
// - vertical scrolling will be added if table exceeds window vertically 
//
datagrid_scroll('objednavkaDatagrid');
```

```javascript
$.nette.init();
//
// this functions adds scrolling to grid with component name 'objednavkaDatagrid'
// - horizontal scrolling will be added if table width exceeds window width
// - vertical scrolling will be added if table height exceeds specified maxHeight
//
datagrid_scroll('cenikVersionDatagrid', { tillEndOfPage:  false, maxHeight: 420});
```


