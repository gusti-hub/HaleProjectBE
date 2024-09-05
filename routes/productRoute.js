const express = require('express');
const Products = require('../models/Product.js');
const Sections = require('../models/Section.js');
const auth = require('../utils/jwtUtils.js');
const DOCs = require('../models/DOCs.js');
const InPdts = require('../models/InPdts.js');
const OutDocs = require('../models/OutDoc.js');
const Sales = require('../models/Sales.js');
const mongoose = require('mongoose');
const StockAdjDocs = require('../models/StockAdj.js');

const router = express.Router();

// router.get('/allpdts', auth, async (req, res) => {
//     try {
//         const pdts = await Products.find();
//         res.status(200).json(pdts);
//     } catch (error) {
//         console.error('Server error:', error);
//         res.status(500).json({ message: 'Server error', error });
//     }
// });

router.get('/allpdts', auth, async (req, res) => {
    try {
        const pdts = await Products.find();

        const enrichedPdts = await Promise.all(pdts.map(async product => {
            const inPdt = await InPdts.findOne({ productID: product._id.toString() });
            return {
                ...product._doc,
                totalRecQty: inPdt ? inPdt.totQty : 0
            };
        }));

        res.status(200).json(enrichedPdts);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

router.post('/addSection', async (req, res) => {
    try {
        const { projectId, secname } = req.body;

        const newSection = new Sections({
            projectId, secname
        });

        await newSection.save();

        res.status(201).json({ message: "Section is added." });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
})

router.delete('/deleteSection/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const section = await Sections.findById(id);
        if (!section) {
            return res.status(404).json({ message: 'Section not found' });
        }

        await Sections.deleteOne({ _id: id });

        res.status(200).json({ message: 'Section deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

router.get('/getsections/:projectId', auth, async (req, res) => {
    try {
        const { projectId } = req.params;
        const sectionData = await Sections.find({ projectId });
        res.status(200).json({ sectionData });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

router.post('/newProduct', async (req, res) => {
    try {
        const { projectId, type, title, desc, imageUrl } = req.body;

        const newProduct = new Products({
            projectId, type, title, desc, imageUrl
        });

        const product = await newProduct.save();

        res.status(201).json({ message: "Product is added.", product });
    } catch (error) {
        console.error('Error registering product:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/newProductItem', async (req, res) => {
    const {
        projectId, type, name, code, qty, sku, vendor, rfq, net_cost, shipping_cost, other_cost, po_amount, buy_tax, buy_sales_tax, 
        sell_markup, client_product_cost, client_price, sell_tax, sell_sales_tax, imageUrl, furnishing, acessory_unit, acessory_len, acessory_wid, acessory_height, 
        acessory_color, acessory_finish, arearug_unit, arearug_len, arearug_wid, arearug_rugpad, arearug_content, arearug_custom, 
        arearug_color, arearug_gauge, arearug_pile, arearug_stitches, arearug_pattern, arearug_construction, arearug_backing, 
        arearug_secondaryBacking, equipment_unit, equipment_len, equipment_wid, equipment_height, equipment_color, artwork_unit, 
        equipment_finish, hardware_unit, hardware_len, hardware_wid, hardware_height, hardware_color, hardware_finish, 
        artwork_len_overall, artwork_wid_overall, artwork_height_overall, artwork_wid_frame, artwork_height_frame, artwork_len_artwork, 
        artwork_wid_artwork, artwork_medium, artwork_frame_item, artwork_frame_material, artwork_frame_finish, artwork_mat_color, 
        artwork_mat_size, artwork_orientation, artwork_glass, artwork_mounting_hardware, casegood_unit, casegood_len, casegood_wid, 
        casegood_height, casegood_top, casegood_finish, casegood_outlet, casegood_hardware, casegood_installation_type, fabric_color, 
        fabric_unit, fabric_width, fabric_horizontal, fabric_vertical, fabric_content, fabric_backing, fabric_cfa_required, fabric_cfa_waived, 
        hardwired_unit, hardwired_len_overall, hardwired_wid_overall, hardwired_height_overall, hardwired_len_fixture, hardwired_wid_fixture, 
        hardwired_height_fixture, hardwired_len_shade, hardwired_wid_shade, hardwired_height_shade, hardwired_color, hardwired_finish, 
        hardwired_base_material, hardwired_shade_material, hardwired_shade_type, hardwired_switch_type, hardwired_quantity, 
        hardwired_socket_type, hardwired_dimmable, hardwired_switch, hardwired_wattaga, hardwired_temperature, hardwired_rating, 
        hardwired, decorative_lighting_unit, decorative_lighting_len_overall, decorative_lighting_wid_overall, decorative_lighting_height_overall, 
        decorative_lighting_len_fixture, decorative_lighting_wid_fixture, decorative_lighting_height_fixture, decorative_lighting_len_shade, 
        decorative_lighting_wid_shade, decorative_lighting_height_shade, decorative_lighting_color, decorative_lighting_finish, 
        decorative_lighting_base_material, decorative_lighting_shade_material, decorative_lighting_shade_type, decorative_lighting_switch_type, 
        decorative_lighting_quantity, decorative_lighting_socket_type, decorative_lighting_dimmable, decorative_lighting_switch, 
        decorative_lighting_wattaga, decorative_lighting_temperature, decorative_lighting_rating, mirror_unit, mirror_len, mirror_wid, mirror_height, 
        mirror_color, mirror_finish, mirror_orientation, mirror_glass, mirror_mounting_hardware, miscellaneous_fabrication_style, 
        miscellaneous_pattern, miscellaneous_insert, table_unit, table_len, table_wid, table_height, table_other_dimension, table_top, 
        table_finish, table_hardware, seating_unit, seating_len, seating_wid, seating_height, seating_color, seating_finish, 
        seating_vendor_provided_fabric, seating_fabric, seating_com_fabric, seating_pattern_name, seating_sku, seating_width, seating_horizontal, 
        seating_vertical, seating_content, seating_backing, seating_qty, wallpaper_color, wallpaper_unit, wallpaper_width, wallpaper_horizontal, 
        wallpaper_vertical, wallpaper_content, wallpaper_type, wallpaper_weight, wallpaper_backing, wallpaper_installation, upholstery_color, upholstery_unit, 
        upholstery_width, upholstery_horizontal, upholstery_vertical, upholstery_content, upholstery_backing, upholstery_qty, wt_unit, wt_len_window, 
        wt_wid_window, wt_height_window, wt_mount, wt_valance, wt_vendor_provided_fabric, wt_fabric, wt_com_fabric, wt_pattern_name, wt_sku, wt_color, 
        wt_horizontal, wt_vertical, wt_content, wt_backing, wt_installation_type, wt_type, wt_drapery_style, wt_drapery_fullness, wt_drapery_hem,
        wt_drapery_construction, wt_drapery_control, wt_drapery_control_location, wt_drapery_hardware, wt_drapery_blackout_linear, wt_shade_style,
        wt_shade_fullness, wt_shade_hem, wt_shade_construction, wt_shade_control_type, wt_shade_control_location, wt_shade_hardware, wt_shade_blackout_linear
    } = req.body;

    try {
        if (furnishing == 'Accessory'){
            const newProduct = new Products({
                projectId,
                type,
                title: name,
                code,
                qty,
                sku,
                furnishing,
                rfq,
                vendor,
                net_cost, 
                shipping_cost, 
                other_cost, 
                po_amount, 
                buy_tax, 
                buy_sales_tax, 
                sell_markup, 
                client_product_cost, 
                client_price, 
                sell_tax, 
                sell_sales_tax, 
                productDetails: {
                    acessory_unit: acessory_unit,
                    acessory_len: acessory_len,
                    acessory_wid: acessory_wid,
                    acessory_height: acessory_height,
                    acessory_color: acessory_color,
                    acessory_finish: acessory_finish,                    
                },
                imageUrl
            });

            await newProduct.save();

            const newInPdt = new InPdts({
                productID: newProduct._id,
                totQty: 0
            });

            await newInPdt.save();

        }
        else if (furnishing == 'Area Rug'){
            const newProduct = new Products({
                projectId,
                type,
                title: name,
                code,
                qty,
                sku,
                furnishing,
                rfq,
                vendor,
                net_cost, 
                shipping_cost, 
                other_cost, 
                po_amount, 
                buy_tax, 
                buy_sales_tax, 
                sell_markup, 
                client_product_cost, 
                client_price, 
                sell_tax, 
                sell_sales_tax, 
                productDetails: {
                    arearug_unit: arearug_unit,
                    arearug_len: arearug_len,
                    arearug_wid: arearug_wid,
                    arearug_rugpad: arearug_rugpad,
                    arearug_content: arearug_content,
                    arearug_custom: arearug_custom,
                    arearug_color: arearug_color,
                    arearug_gauge: arearug_gauge,
                    arearug_pile: arearug_pile,
                    arearug_stitches: arearug_stitches,
                    arearug_pattern: arearug_pattern,
                    arearug_construction: arearug_construction,
                    arearug_backing: arearug_backing,
                    arearug_secondaryBacking: arearug_secondaryBacking,                                  
                },
                imageUrl
            });

            await newProduct.save();

            const newInPdt = new InPdts({
                productID: newProduct._id,
                totQty: 0
            });
    
            await newInPdt.save();
        }        
        else if (furnishing == 'Equipment'){
            const newProduct = new Products({
                projectId,
                type,
                title: name,
                code,
                qty,
                sku,
                furnishing,
                rfq,
                vendor,
                net_cost, 
                shipping_cost, 
                other_cost, 
                po_amount, 
                buy_tax, 
                buy_sales_tax, 
                sell_markup, 
                client_product_cost, 
                client_price, 
                sell_tax, 
                sell_sales_tax, 
                productDetails: {
                    equipment_unit: equipment_unit,
                    equipment_len: equipment_len,
                    equipment_wid: equipment_wid,
                    equipment_height: equipment_height,
                    equipment_color: equipment_color,
                    equipment_finish: equipment_finish,                                                
                },
                imageUrl
            });

            await newProduct.save();

            const newInPdt = new InPdts({
                productID: newProduct._id,
                totQty: 0
            });
    
            await newInPdt.save();
        }  
        else if (furnishing == 'Hardware'){
            const newProduct = new Products({
                projectId,
                type,
                title: name,
                code,
                qty,
                sku,
                furnishing,
                rfq,
                vendor,
                net_cost, 
                shipping_cost, 
                other_cost, 
                po_amount, 
                buy_tax, 
                buy_sales_tax, 
                sell_markup, 
                client_product_cost, 
                client_price, 
                sell_tax, 
                sell_sales_tax, 
                productDetails: {
                    hardware_unit: hardware_unit,
                    hardware_len: hardware_len,
                    hardware_wid: hardware_wid,
                    hardware_height: hardware_height,
                    hardware_color: hardware_color,
                    hardware_finish: hardware_finish,                                                           
                },
                imageUrl
            });

            await newProduct.save();

            const newInPdt = new InPdts({
                productID: newProduct._id,
                totQty: 0
            });
    
            await newInPdt.save();
        }        
        else if (furnishing == 'Artwork'){
            const newProduct = new Products({
                projectId,
                type,
                title: name,
                code,
                qty,
                sku,
                furnishing,
                rfq,
                vendor,
                net_cost, 
                shipping_cost, 
                other_cost, 
                po_amount, 
                buy_tax, 
                buy_sales_tax, 
                sell_markup, 
                client_product_cost, 
                client_price, 
                sell_tax, 
                sell_sales_tax, 
                productDetails: {
                    artwork_unit: artwork_unit,
                    artwork_len_overall: artwork_len_overall,
                    artwork_wid_overall: artwork_wid_overall,
                    artwork_height_overall: artwork_height_overall,
                    artwork_wid_frame: artwork_wid_frame,
                    artwork_height_frame: artwork_height_frame,
                    artwork_len_artwork: artwork_len_artwork,
                    artwork_wid_artwork: artwork_wid_artwork,
                    artwork_medium: artwork_medium,
                    artwork_frame_item: artwork_frame_item,
                    artwork_frame_material: artwork_frame_material,
                    artwork_frame_finish: artwork_frame_finish,
                    artwork_mat_color: artwork_mat_color,
                    artwork_mat_size: artwork_mat_size,
                    artwork_orientation: artwork_orientation,
                    artwork_glass: artwork_glass,
                    artwork_mounting_hardware: artwork_mounting_hardware,                                                                           
                },
                imageUrl
            });

            await newProduct.save();

            const newInPdt = new InPdts({
                productID: newProduct._id,
                totQty: 0
            });
    
            await newInPdt.save();
        }   
        else if (furnishing == 'Casegood'){
            const newProduct = new Products({
                projectId,
                type,
                title: name,
                code,
                qty,
                sku,
                furnishing,
                rfq,
                vendor,
                net_cost, 
                shipping_cost, 
                other_cost, 
                po_amount, 
                buy_tax, 
                buy_sales_tax, 
                sell_markup, 
                client_product_cost, 
                client_price, 
                sell_tax, 
                sell_sales_tax, 
                productDetails: {
                    casegood_unit: casegood_unit,
                    casegood_len: casegood_len,
                    casegood_wid: casegood_wid,
                    casegood_height: casegood_height,
                    casegood_top: casegood_top,
                    casegood_finish: casegood_finish,
                    casegood_outlet: casegood_outlet,
                    casegood_hardware: casegood_hardware,
                    casegood_installation_type: casegood_installation_type,                                                                                          
                },
                imageUrl
            });

            await newProduct.save();

            const newInPdt = new InPdts({
                productID: newProduct._id,
                totQty: 0
            });
    
            await newInPdt.save();
        }
        else if (furnishing == 'Fabric'){
            const newProduct = new Products({
                projectId,
                type,
                title: name,
                code,
                qty,
                sku,
                furnishing,
                rfq,
                vendor,
                net_cost, 
                shipping_cost, 
                other_cost, 
                po_amount, 
                buy_tax, 
                buy_sales_tax, 
                sell_markup, 
                client_product_cost, 
                client_price, 
                sell_tax, 
                sell_sales_tax, 
                productDetails: {
                    fabric_color: fabric_color,
                    fabric_unit: fabric_unit,
                    fabric_width: fabric_width,
                    fabric_horizontal: fabric_horizontal,
                    fabric_vertical: fabric_vertical,
                    fabric_content: fabric_content,
                    fabric_backing: fabric_backing,
                    fabric_cfa_required: fabric_cfa_required,
                    fabric_cfa_waived: fabric_cfa_waived,                                                                                                         
                },
                imageUrl
            });

            await newProduct.save();

            const newInPdt = new InPdts({
                productID: newProduct._id,
                totQty: 0
            });
    
            await newInPdt.save();
        }
        else if (furnishing == 'Light Fixture (hardwired)'){
            const newProduct = new Products({
                projectId,
                type,
                title: name,
                code,
                qty,
                sku,
                furnishing,
                rfq,
                vendor,
                net_cost, 
                shipping_cost, 
                other_cost, 
                po_amount, 
                buy_tax, 
                buy_sales_tax, 
                sell_markup, 
                client_product_cost, 
                client_price, 
                sell_tax, 
                sell_sales_tax, 
                productDetails: {
                    hardwired_unit: hardwired_unit,
                    hardwired_len_overall: hardwired_len_overall,
                    hardwired_wid_overall: hardwired_wid_overall,
                    hardwired_height_overall: hardwired_height_overall,
                    hardwired_len_fixture: hardwired_len_fixture,
                    hardwired_wid_fixture: hardwired_wid_fixture,
                    hardwired_height_fixture: hardwired_height_fixture,
                    hardwired_len_shade: hardwired_len_shade,
                    hardwired_wid_shade: hardwired_wid_shade,
                    hardwired_height_shade: hardwired_height_shade,
                    hardwired_color: hardwired_color,
                    hardwired_finish: hardwired_finish,
                    hardwired_base_material: hardwired_base_material,
                    hardwired_shade_material: hardwired_shade_material,
                    hardwired_shade_type: hardwired_shade_type,
                    hardwired_switch_type: hardwired_switch_type,
                    hardwired_quantity: hardwired_quantity,
                    hardwired_socket_type: hardwired_socket_type,
                    hardwired_dimmable: hardwired_dimmable,
                    hardwired_switch: hardwired_switch,
                    hardwired_wattaga: hardwired_wattaga,
                    hardwired_temperature: hardwired_temperature,
                    hardwired_rating: hardwired_rating,
                    hardwired: hardwired,                                                                                                                         
                },
                imageUrl
            });
            await newProduct.save();

            const newInPdt = new InPdts({
                productID: newProduct._id,
                totQty: 0
            });
    
            await newInPdt.save();
        }        
        else if (furnishing == 'Decorative Lighting'){
            const newProduct = new Products({
                projectId,
                type,
                title: name,
                code,
                qty,
                sku,
                furnishing,
                rfq,
                vendor,
                net_cost, 
                shipping_cost, 
                other_cost, 
                po_amount, 
                buy_tax, 
                buy_sales_tax, 
                sell_markup, 
                client_product_cost, 
                client_price, 
                sell_tax, 
                sell_sales_tax, 
                productDetails: {
                    decorative_lighting_unit: decorative_lighting_unit,
                    decorative_lighting_len_overall: decorative_lighting_len_overall,
                    decorative_lighting_wid_overall: decorative_lighting_wid_overall,
                    decorative_lighting_height_overall: decorative_lighting_height_overall,
                    decorative_lighting_len_fixture: decorative_lighting_len_fixture,
                    decorative_lighting_wid_fixture: decorative_lighting_wid_fixture,
                    decorative_lighting_height_fixture: decorative_lighting_height_fixture,
                    decorative_lighting_len_shade: decorative_lighting_len_shade,
                    decorative_lighting_wid_shade: decorative_lighting_wid_shade,
                    decorative_lighting_height_shade: decorative_lighting_height_shade,
                    decorative_lighting_color: decorative_lighting_color,
                    decorative_lighting_finish: decorative_lighting_finish,
                    decorative_lighting_base_material: decorative_lighting_base_material,
                    decorative_lighting_shade_material: decorative_lighting_shade_material,
                    decorative_lighting_shade_type: decorative_lighting_shade_type,
                    decorative_lighting_switch_type: decorative_lighting_switch_type,
                    decorative_lighting_quantity: decorative_lighting_quantity,
                    decorative_lighting_socket_type: decorative_lighting_socket_type,
                    decorative_lighting_dimmable: decorative_lighting_dimmable,
                    decorative_lighting_switch: decorative_lighting_switch,
                    decorative_lighting_wattaga: decorative_lighting_wattaga,
                    decorative_lighting_temperature: decorative_lighting_temperature,
                    decorative_lighting_rating: decorative_lighting_rating,                                                                                                                                               
                },
                imageUrl
            });
        await newProduct.save();

        const newInPdt = new InPdts({
            productID: newProduct._id,
            totQty: 0
        });

        await newInPdt.save();

        }   
        else if (furnishing == 'Mirror'){
            const newProduct = new Products({
                projectId,
                type,
                title: name,
                code,
                qty,
                sku,
                furnishing,
                rfq,
                vendor,
                net_cost, 
                shipping_cost, 
                other_cost, 
                po_amount, 
                buy_tax, 
                buy_sales_tax, 
                sell_markup, 
                client_product_cost, 
                client_price, 
                sell_tax, 
                sell_sales_tax, 
                productDetails: {
                    mirror_unit: mirror_unit,
                    mirror_len: mirror_len,
                    mirror_wid: mirror_wid,
                    mirror_height: mirror_height,
                    mirror_color: mirror_color,
                    mirror_finish: mirror_finish,
                    mirror_orientation: mirror_orientation,
                    mirror_glass: mirror_glass,
                    mirror_mounting_hardware: mirror_mounting_hardware,                                                                                                                                                             
                },
                imageUrl
            });
        await newProduct.save();

        const newInPdt = new InPdts({
            productID: newProduct._id,
            totQty: 0
        });

        await newInPdt.save();

        }   
        else if (furnishing == 'Miscellaneous'){
            const newProduct = new Products({
                projectId,
                type,
                title: name,
                code,
                qty,
                sku,
                furnishing,
                rfq,
                vendor,
                net_cost, 
                shipping_cost, 
                other_cost, 
                po_amount, 
                buy_tax, 
                buy_sales_tax, 
                sell_markup, 
                client_product_cost, 
                client_price, 
                sell_tax, 
                sell_sales_tax, 
                productDetails: {
                    miscellaneous_fabrication_style: miscellaneous_fabrication_style,
                    miscellaneous_pattern: miscellaneous_pattern,
                    miscellaneous_insert: miscellaneous_insert,                                                                                                                                                                               
                },
                imageUrl
            });
        await newProduct.save();

        const newInPdt = new InPdts({
            productID: newProduct._id,
            totQty: 0
        });

        await newInPdt.save();

        }   
        else if (furnishing == 'Table'){
            const newProduct = new Products({
                projectId,
                type,
                title: name,
                code,
                qty,
                sku,
                furnishing,
                rfq,
                vendor,
                net_cost, 
                shipping_cost, 
                other_cost, 
                po_amount, 
                buy_tax, 
                buy_sales_tax, 
                sell_markup, 
                client_product_cost, 
                client_price, 
                sell_tax, 
                sell_sales_tax, 
                productDetails: {
                    table_unit: table_unit,
                    table_len: table_len,
                    table_wid: table_wid,
                    table_height: table_height,
                    table_other_dimension: table_other_dimension,
                    table_top: table_top,
                    table_finish: table_finish,
                    table_hardware: table_hardware,                                                                                                                                                                                                  
                },
                imageUrl
            });
            await newProduct.save();

            const newInPdt = new InPdts({
                productID: newProduct._id,
                totQty: 0
            });
    
            await newInPdt.save();
        }
        else if (furnishing == 'Seating'){
            const newProduct = new Products({
                projectId,
                type,
                title: name,
                code,
                qty,
                sku,
                furnishing,
                rfq,
                vendor,
                net_cost, 
                shipping_cost, 
                other_cost, 
                po_amount, 
                buy_tax, 
                buy_sales_tax, 
                sell_markup, 
                client_product_cost, 
                client_price, 
                sell_tax, 
                sell_sales_tax, 
                productDetails: {
                    seating_unit: seating_unit,
                    seating_len: seating_len,
                    seating_wid: seating_wid,
                    seating_height: seating_height,
                    seating_color: seating_color,
                    seating_finish: seating_finish,
                    seating_vendor_provided_fabric: seating_vendor_provided_fabric,
                    seating_fabric: seating_fabric,
                    seating_com_fabric: seating_com_fabric,
                    seating_pattern_name: seating_pattern_name,
                    seating_sku: seating_sku,
                    seating_color: seating_color,
                    seating_width: seating_width,
                    seating_horizontal: seating_horizontal,
                    seating_vertical: seating_vertical,
                    seating_content: seating_content,
                    seating_backing: seating_backing,
                    seating_qty: seating_qty,                                                                                                                                                                                                                
                },
                imageUrl
            });
            await newProduct.save();

            const newInPdt = new InPdts({
                productID: newProduct._id,
                totQty: 0
            });
    
            await newInPdt.save();
        } 
        else if (furnishing == 'Wallpaper'){
            const newProduct = new Products({
                projectId,
                type,
                title: name,
                code,
                qty,
                sku,
                furnishing,
                rfq,
                vendor,
                net_cost, 
                shipping_cost, 
                other_cost, 
                po_amount, 
                buy_tax, 
                buy_sales_tax, 
                sell_markup, 
                client_product_cost, 
                client_price, 
                sell_tax, 
                sell_sales_tax, 
                productDetails: {
                    wallpaper_color: wallpaper_color,
                    wallpaper_unit: wallpaper_unit,
                    wallpaper_width: wallpaper_width,
                    wallpaper_horizontal: wallpaper_horizontal,
                    wallpaper_vertical: wallpaper_vertical,
                    wallpaper_content: wallpaper_content,
                    wallpaper_type: wallpaper_type,
                    wallpaper_weight: wallpaper_weight,
                    wallpaper_backing: wallpaper_backing,
                    wallpaper_installation: wallpaper_installation,                                                                                                                                                                                                                                
                },
                imageUrl
            });
            await newProduct.save();

            const newInPdt = new InPdts({
                productID: newProduct._id,
                totQty: 0
            });
    
            await newInPdt.save();
        }          
        else if (furnishing == 'Upholstery'){
            const newProduct = new Products({
                projectId,
                type,
                title: name,
                code,
                qty,
                sku,
                furnishing,
                rfq,
                vendor,
                net_cost, 
                shipping_cost, 
                other_cost, 
                po_amount, 
                buy_tax, 
                buy_sales_tax, 
                sell_markup, 
                client_product_cost, 
                client_price, 
                sell_tax, 
                sell_sales_tax, 
                productDetails: {
                    upholstery_color: upholstery_color,
                    upholstery_unit: upholstery_unit,
                    upholstery_width: upholstery_width,
                    upholstery_horizontal: upholstery_horizontal,
                    upholstery_vertical: upholstery_vertical,
                    upholstery_content: upholstery_content,
                    upholstery_backing: upholstery_backing,
                    upholstery_qty: upholstery_qty,                                                                                                                                                                                                                                                  
                },
                imageUrl
            });
            await newProduct.save();

            const newInPdt = new InPdts({
                productID: newProduct._id,
                totQty: 0
            });
    
            await newInPdt.save();
        }          
        else if (furnishing == 'Window Treatment'){
            const newProduct = new Products({
                projectId,
                type,
                title: name,
                code,
                qty,
                sku,
                furnishing,
                rfq,
                vendor,
                net_cost, 
                shipping_cost, 
                other_cost, 
                po_amount, 
                buy_tax, 
                buy_sales_tax, 
                sell_markup, 
                client_product_cost, 
                client_price, 
                sell_tax, 
                sell_sales_tax, 
                productDetails: {
                    wt_unit: wt_unit,
                    wt_len_window: wt_len_window,
                    wt_wid_window: wt_wid_window,
                    wt_height_window: wt_height_window,
                    wt_mount: wt_mount,
                    wt_valance: wt_valance,
                    wt_vendor_provided_fabric: wt_vendor_provided_fabric,
                    wt_fabric: wt_fabric,
                    wt_com_fabric: wt_com_fabric,
                    wt_pattern_name: wt_pattern_name,
                    wt_sku: wt_sku,
                    wt_color: wt_color,
                    wt_horizontal: wt_horizontal,
                    wt_vertical: wt_vertical,
                    wt_content: wt_content,
                    wt_backing: wt_backing,
                    wt_installation_type: wt_installation_type,
                    wt_type: wt_type,
                    wt_drapery_style: wt_drapery_style,
                    wt_drapery_fullness: wt_drapery_fullness,
                    wt_drapery_hem: wt_drapery_hem,
                    wt_drapery_construction: wt_drapery_construction,
                    wt_drapery_control: wt_drapery_control,
                    wt_drapery_control_location: wt_drapery_control_location,
                    wt_drapery_hardware: wt_drapery_hardware,
                    wt_drapery_blackout_linear: wt_drapery_blackout_linear,
                    wt_shade_style: wt_shade_style,
                    wt_shade_fullness: wt_shade_fullness,
                    wt_shade_hem: wt_shade_hem,
                    wt_shade_construction: wt_shade_construction,
                    wt_shade_control_type: wt_shade_control_type,
                    wt_shade_control_location: wt_shade_control_location,
                    wt_shade_hardware: wt_shade_hardware,
                    wt_shade_blackout_linear: wt_shade_blackout_linear,                                                                                                                                                                                                                                                                  
                },
                imageUrl
            });
            await newProduct.save();

            const newInPdt = new InPdts({
                productID: newProduct._id,
                totQty: 0
            });
    
            await newInPdt.save();
        }      

        res.status(201).json({ message: 'Product registered successfully'});
    } catch (error) {
        res.status(400).json({ message: 'Error registering product', error: error.message });
    }
});

router.get('/allProducts/:projectId', auth, async (req, res) => {
    try {
        const { projectId } = req.params;
        const allProducts = await Products.find({ projectId });
        res.status(200).json({ allProducts });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

router.put('/product/:projectId/:name/newComment/:_id', async (req, res) => {
    const { projectId, name, _id } = req.params;
    const { body } = req.body;

    try {
        const product = await Products.findOne({ _id, projectId });

        if (!product) {
            console.log('Product not found'); // Log if product is not found
            return res.status(404).json({ message: 'Product not found' });
        }

        const newComment = {
            name: name,
            body
        };

        product.comments.push(newComment);

        await product.save();

        res.status(201).json({ message: 'Comment added successfully', product });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/newChat/:id', async (req, res) => {
    const { id } = req.params;
    const { name, body, userType } = req.body;

    try {
        const product = await Products.findById(id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found!' });
        }

        const newChat = {
            name: name,
            body: body,
            userType: userType
        };

        product.chats.push(newChat);

        await product.save();

        res.status(201).json({ message: 'Chat is updated' });
    } catch (error) {
        console.error('Error adding chat:', error);
        res.status(500).json({ message: 'Error adding chat!' });
    }
});

router.put('/product/:_id', async (req, res) => {
    const { _id } = req.params;
    const { title, desc, imageUrl } = req.body;
    try {
        const pdt = await Products.findById(_id);

        if (!pdt) {
            return res.status(404).json({ message: 'Item not found' });
        }

        pdt.title = title || pdt.title;
        pdt.desc = desc || pdt.desc;
        pdt.imageUrl = imageUrl || pdt.imageUrl;

        await pdt.save();

        res.status(200).json({ message: 'Item updated successfully' });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

router.put('/newProductItem/:id', async (req, res) => {
    const {
        projectId, type, name, code, qty, sku, imageUrl, vendor, rfq, net_cost, shipping_cost, other_cost, po_amount, buy_tax, buy_sales_tax, 
        sell_markup, client_product_cost, client_price, sell_tax, sell_sales_tax, furnishing, acessory_unit, acessory_len, acessory_wid, acessory_height, 
        acessory_color, acessory_finish, arearug_unit, arearug_len, arearug_wid, arearug_rugpad, arearug_content, arearug_custom,
        arearug_color, arearug_gauge, arearug_pile, arearug_stitches, arearug_pattern, arearug_construction, arearug_backing, 
        arearug_secondaryBacking, equipment_unit, equipment_len, equipment_wid, equipment_height, equipment_color, 
        equipment_finish, hardware_unit, hardware_len, hardware_wid, hardware_height, hardware_color, hardware_finish, artwork_unit, 
        artwork_len_overall, artwork_wid_overall, artwork_height_overall, artwork_wid_frame, artwork_height_frame, artwork_len_artwork, 
        artwork_wid_artwork, artwork_medium, artwork_frame_item, artwork_frame_material, artwork_frame_finish, artwork_mat_color, 
        artwork_mat_size, artwork_orientation, artwork_glass, artwork_mounting_hardware, casegood_unit, casegood_len, casegood_wid, 
        casegood_height, casegood_top, casegood_finish, casegood_outlet, casegood_hardware, casegood_installation_type, fabric_color, 
        fabric_unit, fabric_width, fabric_horizontal, fabric_vertical, fabric_content, fabric_backing, fabric_cfa_required, fabric_cfa_waived, 
        hardwired_unit, hardwired_len_overall, hardwired_wid_overall, hardwired_height_overall, hardwired_len_fixture, hardwired_wid_fixture, 
        hardwired_height_fixture, hardwired_len_shade, hardwired_wid_shade, hardwired_height_shade, hardwired_color, hardwired_finish, 
        hardwired_base_material, hardwired_shade_material, hardwired_shade_type, hardwired_switch_type, hardwired_quantity, 
        hardwired_socket_type, hardwired_dimmable, hardwired_switch, hardwired_wattaga, hardwired_temperature, hardwired_rating, 
        hardwired, decorative_lighting_unit, decorative_lighting_len_overall, decorative_lighting_wid_overall, decorative_lighting_height_overall, 
        decorative_lighting_len_fixture, decorative_lighting_wid_fixture, decorative_lighting_height_fixture, decorative_lighting_len_shade, 
        decorative_lighting_wid_shade, decorative_lighting_height_shade, decorative_lighting_color, decorative_lighting_finish, 
        decorative_lighting_base_material, decorative_lighting_shade_material, decorative_lighting_shade_type, decorative_lighting_switch_type, 
        decorative_lighting_quantity, decorative_lighting_socket_type, decorative_lighting_dimmable, decorative_lighting_switch, 
        decorative_lighting_wattaga, decorative_lighting_temperature, decorative_lighting_rating, mirror_unit, mirror_len, mirror_wid, mirror_height, 
        mirror_color, mirror_finish, mirror_orientation, mirror_glass, mirror_mounting_hardware, miscellaneous_fabrication_style, 
        miscellaneous_pattern, miscellaneous_insert, table_unit, table_len, table_wid, table_height, table_other_dimension, table_top, 
        table_finish, table_hardware, seating_unit, seating_len, seating_wid, seating_height, seating_color, seating_finish, 
        seating_vendor_provided_fabric, seating_fabric, seating_com_fabric, seating_pattern_name, seating_sku, seating_width, seating_horizontal, 
        seating_vertical, seating_content, seating_backing, seating_qty, wallpaper_color, wallpaper_unit, wallpaper_width, wallpaper_horizontal, 
        wallpaper_vertical, wallpaper_content, wallpaper_type, wallpaper_weight, wallpaper_backing, wallpaper_installation, upholstery_color, upholstery_unit, 
        upholstery_width, upholstery_horizontal, upholstery_vertical, upholstery_content, upholstery_backing, upholstery_qty, wt_unit, wt_len_window, 
        wt_wid_window, wt_height_window, wt_mount, wt_valance, wt_vendor_provided_fabric, wt_fabric, wt_com_fabric, wt_pattern_name, wt_sku, wt_color, 
        wt_horizontal, wt_vertical, wt_content, wt_backing, wt_installation_type, wt_type, wt_drapery_style, wt_drapery_fullness, wt_drapery_hem,
        wt_drapery_construction, wt_drapery_control, wt_drapery_control_location, wt_drapery_hardware, wt_drapery_blackout_linear, wt_shade_style,
        wt_shade_fullness, wt_shade_hem, wt_shade_construction, wt_shade_control_type, wt_shade_control_location, wt_shade_hardware, wt_shade_blackout_linear
    } = req.body;

    try {
        const existingProduct = await Products.findById(req.params.id);

        if (!existingProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }else  if (furnishing == 'Accessory'){
            const updatedProduct = await Products.findByIdAndUpdate(
                req.params.id,
                {
                    projectId: projectId || existingProduct.projectId,
                    type: type || existingProduct.type,
                    title: name || existingProduct.title,
                    code: code || existingProduct.code,
                    sku: sku || existingProduct.sku,
                    furnishing: furnishing || existingProduct.furnishing,
                    vendor: vendor || existingProduct.vendor,
                    rfq: rfq || existingProduct.rfq,
                    net_cost: net_cost || existingProduct.net_cost,
                    shipping_cost: shipping_cost || existingProduct.shipping_cost,
                    other_cost: other_cost || existingProduct.other_cost,
                    po_amount: po_amount || existingProduct.po_amount,
                    buy_tax: buy_tax || existingProduct.buy_tax,
                    buy_sales_tax: buy_sales_tax || existingProduct.buy_sales_tax,
                    sell_markup: sell_markup || existingProduct.sell_markup,
                    client_product_cost: client_product_cost || existingProduct.client_product_cost,
                    client_price: client_price || existingProduct.client_price,
                    sell_tax: sell_tax || existingProduct.sell_tax,
                    sell_sales_tax: sell_sales_tax || existingProduct.sell_sales_tax,
                    qty: qty || existingProduct.qty,
                    productDetails: {
                        acessory_unit: acessory_unit || existingProduct.productDetails.acessory_unit,
                        acessory_len: acessory_len || existingProduct.productDetails.acessory_len,
                        acessory_wid: acessory_wid || existingProduct.productDetails.acessory_wid,
                        acessory_height: acessory_height || existingProduct.productDetails.acessory_height,
                        acessory_color: acessory_color || existingProduct.productDetails.acessory_color,
                        acessory_finish: acessory_finish || existingProduct.productDetails.acessory_finish,                    
                    },
                    imageUrl: imageUrl || existingProduct.imageUrl
                },
                { new: true, runValidators: true }
            );
        }else  if (furnishing == 'Area Rug'){
            const updatedProduct = await Products.findByIdAndUpdate(
                req.params.id,
                {
                    projectId: projectId || existingProduct.projectId,
                    type: type || existingProduct.type,
                    title: name || existingProduct.title,
                    code: code || existingProduct.code,
                    sku: sku || existingProduct.sku,
                    furnishing: furnishing || existingProduct.furnishing,
                    vendor: vendor || existingProduct.vendor,
                    rfq: rfq || existingProduct.rfq,
                    net_cost: net_cost || existingProduct.net_cost,
                    shipping_cost: shipping_cost || existingProduct.shipping_cost,
                    other_cost: other_cost || existingProduct.other_cost,
                    po_amount: po_amount || existingProduct.po_amount,
                    buy_tax: buy_tax || existingProduct.buy_tax,
                    buy_sales_tax: buy_sales_tax || existingProduct.buy_sales_tax,
                    sell_markup: sell_markup || existingProduct.sell_markup,
                    client_product_cost: client_product_cost || existingProduct.client_product_cost,
                    client_price: client_price || existingProduct.client_price,
                    sell_tax: sell_tax || existingProduct.sell_tax,
                    sell_sales_tax: sell_sales_tax || existingProduct.sell_sales_tax,
                    qty: qty || existingProduct.qty,
                    productDetails: {
                        arearug_unit: arearug_unit || existingProduct.productDetails.arearug_unit,
                        arearug_len: arearug_len || existingProduct.productDetails.arearug_len,
                        arearug_wid: arearug_wid || existingProduct.productDetails.arearug_wid,
                        arearug_rugpad: arearug_rugpad || existingProduct.productDetails.arearug_rugpad,
                        arearug_content: arearug_content || existingProduct.productDetails.arearug_content,
                        arearug_custom: arearug_custom || existingProduct.productDetails.arearug_custom,
                        arearug_color: arearug_color || existingProduct.productDetails.arearug_color,
                        arearug_gauge: arearug_gauge || existingProduct.productDetails.arearug_gauge,
                        arearug_pile: arearug_pile || existingProduct.productDetails.arearug_pile,
                        arearug_stitches: arearug_stitches || existingProduct.productDetails.arearug_stitches,
                        arearug_pattern: arearug_pattern || existingProduct.productDetails.arearug_pattern,
                        arearug_construction: arearug_construction || existingProduct.productDetails.arearug_construction,
                        arearug_backing: arearug_backing || existingProduct.productDetails.arearug_backing,
                        arearug_secondaryBacking: arearug_secondaryBacking || existingProduct.productDetails.arearug_secondaryBacking,                                         
                    },
                    imageUrl: imageUrl || existingProduct.imageUrl
                },
                { new: true, runValidators: true }
            );
        }else  if (furnishing == 'Equipment'){
            const updatedProduct = await Products.findByIdAndUpdate(
                req.params.id,
                {
                    projectId: projectId || existingProduct.projectId,
                    type: type || existingProduct.type,
                    title: name || existingProduct.title,
                    code: code || existingProduct.code,
                    sku: sku || existingProduct.sku,
                    furnishing: furnishing || existingProduct.furnishing,
                    vendor: vendor || existingProduct.vendor,
                    rfq: rfq || existingProduct.rfq,
                    net_cost: net_cost || existingProduct.net_cost,
                    shipping_cost: shipping_cost || existingProduct.shipping_cost,
                    other_cost: other_cost || existingProduct.other_cost,
                    po_amount: po_amount || existingProduct.po_amount,
                    buy_tax: buy_tax || existingProduct.buy_tax,
                    buy_sales_tax: buy_sales_tax || existingProduct.buy_sales_tax,
                    sell_markup: sell_markup || existingProduct.sell_markup,
                    client_product_cost: client_product_cost || existingProduct.client_product_cost,
                    client_price: client_price || existingProduct.client_price,
                    sell_tax: sell_tax || existingProduct.sell_tax,
                    sell_sales_tax: sell_sales_tax || existingProduct.sell_sales_tax,
                    qty: qty || existingProduct.qty,
                    productDetails: {
                        equipment_unit: equipment_unit || existingProduct.productDetails.equipment_unit,
                        equipment_len: equipment_len || existingProduct.productDetails.equipment_len,
                        equipment_wid: equipment_wid || existingProduct.productDetails.equipment_wid,
                        equipment_height: equipment_height || existingProduct.productDetails.equipment_height,
                        equipment_color: equipment_color || existingProduct.productDetails.equipment_color,
                        equipment_finish: equipment_finish || existingProduct.productDetails.equipment_finish,                                                               
                    },
                    imageUrl: imageUrl || existingProduct.imageUrl
                },
                { new: true, runValidators: true }
            );
        }else  if (furnishing == 'Hardware'){
            const updatedProduct = await Products.findByIdAndUpdate(
                req.params.id,
                {
                    projectId: projectId || existingProduct.projectId,
                    type: type || existingProduct.type,
                    title: name || existingProduct.title,
                    code: code || existingProduct.code,
                    sku: sku || existingProduct.sku,
                    furnishing: furnishing || existingProduct.furnishing,
                    vendor: vendor || existingProduct.vendor,
                    rfq: rfq || existingProduct.rfq,
                    net_cost: net_cost || existingProduct.net_cost,
                    shipping_cost: shipping_cost || existingProduct.shipping_cost,
                    other_cost: other_cost || existingProduct.other_cost,
                    po_amount: po_amount || existingProduct.po_amount,
                    buy_tax: buy_tax || existingProduct.buy_tax,
                    buy_sales_tax: buy_sales_tax || existingProduct.buy_sales_tax,
                    sell_markup: sell_markup || existingProduct.sell_markup,
                    client_product_cost: client_product_cost || existingProduct.client_product_cost,
                    client_price: client_price || existingProduct.client_price,
                    sell_tax: sell_tax || existingProduct.sell_tax,
                    sell_sales_tax: sell_sales_tax || existingProduct.sell_sales_tax,
                    qty: qty || existingProduct.qty,
                    productDetails: {
                        hardware_unit: hardware_unit || existingProduct.productDetails.hardware_unit,
                        hardware_len: hardware_len || existingProduct.productDetails.hardware_len,
                        hardware_wid: hardware_wid || existingProduct.productDetails.hardware_wid,
                        hardware_height: hardware_height || existingProduct.productDetails.hardware_height,
                        hardware_color: hardware_color || existingProduct.productDetails.hardware_color,
                        hardware_finish: hardware_finish || existingProduct.productDetails.hardware_finish,                                                                                   
                    },
                    imageUrl: imageUrl || existingProduct.imageUrl
                },
                { new: true, runValidators: true }
            );
        }else  if (furnishing == 'Artwork'){
            console.log(existingProduct)
            console.log(artwork_len_overall)
            const updatedProduct = await Products.findByIdAndUpdate(
                req.params.id,
                {
                    projectId: projectId || existingProduct.projectId,
                    type: type || existingProduct.type,
                    title: name || existingProduct.title,
                    code: code || existingProduct.code,
                    sku: sku || existingProduct.sku,
                    furnishing: furnishing || existingProduct.furnishing,
                    vendor: vendor || existingProduct.vendor,
                    rfq: rfq || existingProduct.rfq,
                    net_cost: net_cost || existingProduct.net_cost,
                    shipping_cost: shipping_cost || existingProduct.shipping_cost,
                    other_cost: other_cost || existingProduct.other_cost,
                    po_amount: po_amount || existingProduct.po_amount,
                    buy_tax: buy_tax || existingProduct.buy_tax,
                    buy_sales_tax: buy_sales_tax || existingProduct.buy_sales_tax,
                    sell_markup: sell_markup || existingProduct.sell_markup,
                    client_product_cost: client_product_cost || existingProduct.client_product_cost,
                    client_price: client_price || existingProduct.client_price,
                    sell_tax: sell_tax || existingProduct.sell_tax,
                    sell_sales_tax: sell_sales_tax || existingProduct.sell_sales_tax,
                    qty: qty || existingProduct.qty,
                    productDetails: {
                        artwork_unit: artwork_unit || existingProduct.productDetails.artwork_unit,
                        artwork_len_overall: artwork_len_overall || existingProduct.productDetails.artwork_len_overall,
                        artwork_wid_overall: artwork_wid_overall || existingProduct.productDetails.artwork_wid_overall,
                        artwork_height_overall: artwork_height_overall || existingProduct.productDetails.artwork_height_overall,
                        artwork_wid_frame: artwork_wid_frame || existingProduct.productDetails.artwork_wid_frame,
                        artwork_height_frame: artwork_height_frame || existingProduct.productDetails.artwork_height_frame,
                        artwork_len_artwork: artwork_len_artwork || existingProduct.productDetails.artwork_len_artwork,
                        artwork_wid_artwork: artwork_wid_artwork || existingProduct.productDetails.artwork_wid_artwork,
                        artwork_medium: artwork_medium || existingProduct.productDetails.artwork_medium,
                        artwork_frame_item: artwork_frame_item || existingProduct.productDetails.artwork_frame_item,
                        artwork_frame_material: artwork_frame_material || existingProduct.productDetails.artwork_frame_material,
                        artwork_frame_finish: artwork_frame_finish || existingProduct.productDetails.artwork_frame_finish,
                        artwork_mat_color: artwork_mat_color || existingProduct.productDetails.artwork_mat_color,
                        artwork_mat_size: artwork_mat_size || existingProduct.productDetails.artwork_mat_size,
                        artwork_orientation: artwork_orientation || existingProduct.productDetails.artwork_orientation,
                        artwork_glass: artwork_glass || existingProduct.productDetails.artwork_glass,
                        artwork_mounting_hardware: artwork_mounting_hardware || existingProduct.productDetails.artwork_mounting_hardware,                                                                                                       
                    },
                    imageUrl: imageUrl || existingProduct.imageUrl
                },
                { new: true, runValidators: true }
            );
        }else  if (furnishing == 'Casegood'){
            const updatedProduct = await Products.findByIdAndUpdate(
                req.params.id,
                {
                    projectId: projectId || existingProduct.projectId,
                    type: type || existingProduct.type,
                    title: name || existingProduct.title,
                    code: code || existingProduct.code,
                    sku: sku || existingProduct.sku,
                    furnishing: furnishing || existingProduct.furnishing,
                    vendor: vendor || existingProduct.vendor,
                    rfq: rfq || existingProduct.rfq,
                    net_cost: net_cost || existingProduct.net_cost,
                    shipping_cost: shipping_cost || existingProduct.shipping_cost,
                    other_cost: other_cost || existingProduct.other_cost,
                    po_amount: po_amount || existingProduct.po_amount,
                    buy_tax: buy_tax || existingProduct.buy_tax,
                    buy_sales_tax: buy_sales_tax || existingProduct.buy_sales_tax,
                    sell_markup: sell_markup || existingProduct.sell_markup,
                    client_product_cost: client_product_cost || existingProduct.client_product_cost,
                    client_price: client_price || existingProduct.client_price,
                    sell_tax: sell_tax || existingProduct.sell_tax,
                    sell_sales_tax: sell_sales_tax || existingProduct.sell_sales_tax,
                    qty: qty || existingProduct.qty,
                    productDetails: {
                        casegood_unit: casegood_unit || existingProduct.productDetails.casegood_unit,
                        casegood_len: casegood_len || existingProduct.productDetails.casegood_len,
                        casegood_wid: casegood_wid || existingProduct.productDetails.casegood_wid,
                        casegood_height: casegood_height || existingProduct.productDetails.casegood_height,
                        casegood_top: casegood_top || existingProduct.productDetails.casegood_top,
                        casegood_finish: casegood_finish || existingProduct.productDetails.casegood_finish,
                        casegood_outlet: casegood_outlet || existingProduct.productDetails.casegood_outlet,
                        casegood_hardware: casegood_hardware || existingProduct.productDetails.casegood_hardware,
                        casegood_installation_type: casegood_installation_type || existingProduct.productDetails.casegood_installation_type,                                                                                                                             
                    },
                    imageUrl: imageUrl || existingProduct.imageUrl
                },
                { new: true, runValidators: true }
            );
        }else  if (furnishing == 'Fabric'){
            const updatedProduct = await Products.findByIdAndUpdate(
                req.params.id,
                {
                    projectId: projectId || existingProduct.projectId,
                    type: type || existingProduct.type,
                    title: name || existingProduct.title,
                    code: code || existingProduct.code,
                    sku: sku || existingProduct.sku,
                    furnishing: furnishing || existingProduct.furnishing,
                    vendor: vendor || existingProduct.vendor,
                    rfq: rfq || existingProduct.rfq,
                    net_cost: net_cost || existingProduct.net_cost,
                    shipping_cost: shipping_cost || existingProduct.shipping_cost,
                    other_cost: other_cost || existingProduct.other_cost,
                    po_amount: po_amount || existingProduct.po_amount,
                    buy_tax: buy_tax || existingProduct.buy_tax,
                    buy_sales_tax: buy_sales_tax || existingProduct.buy_sales_tax,
                    sell_markup: sell_markup || existingProduct.sell_markup,
                    client_product_cost: client_product_cost || existingProduct.client_product_cost,
                    client_price: client_price || existingProduct.client_price,
                    sell_tax: sell_tax || existingProduct.sell_tax,
                    sell_sales_tax: sell_sales_tax || existingProduct.sell_sales_tax,
                    qty: qty || existingProduct.qty,
                    productDetails: {
                        fabric_color: fabric_color || existingProduct.productDetails.fabric_color,
                        fabric_unit: fabric_unit || existingProduct.productDetails.fabric_unit,
                        fabric_width: fabric_width || existingProduct.productDetails.fabric_width,
                        fabric_horizontal: fabric_horizontal || existingProduct.productDetails.fabric_horizontal,
                        fabric_vertical: fabric_vertical || existingProduct.productDetails.fabric_vertical,
                        fabric_content: fabric_content || existingProduct.productDetails.fabric_content,
                        fabric_backing: fabric_backing || existingProduct.productDetails.fabric_backing,
                        fabric_cfa_required: fabric_cfa_required || existingProduct.productDetails.fabric_cfa_required,
                        fabric_cfa_waived: fabric_cfa_waived || existingProduct.productDetails.fabric_cfa_waived,                                                                                                                                                     
                    },
                    imageUrl: imageUrl || existingProduct.imageUrl
                },
                { new: true, runValidators: true }
            );
        }else  if (furnishing == 'Light Fixture (hardwired)'){
            const updatedProduct = await Products.findByIdAndUpdate(
                req.params.id,
                {
                    projectId: projectId || existingProduct.projectId,
                    type: type || existingProduct.type,
                    title: name || existingProduct.title,
                    code: code || existingProduct.code,
                    sku: sku || existingProduct.sku,
                    furnishing: furnishing || existingProduct.furnishing,
                    vendor: vendor || existingProduct.vendor,
                    rfq: rfq || existingProduct.rfq,
                    net_cost: net_cost || existingProduct.net_cost,
                    shipping_cost: shipping_cost || existingProduct.shipping_cost,
                    other_cost: other_cost || existingProduct.other_cost,
                    po_amount: po_amount || existingProduct.po_amount,
                    buy_tax: buy_tax || existingProduct.buy_tax,
                    buy_sales_tax: buy_sales_tax || existingProduct.buy_sales_tax,
                    sell_markup: sell_markup || existingProduct.sell_markup,
                    client_product_cost: client_product_cost || existingProduct.client_product_cost,
                    client_price: client_price || existingProduct.client_price,
                    sell_tax: sell_tax || existingProduct.sell_tax,
                    sell_sales_tax: sell_sales_tax || existingProduct.sell_sales_tax,
                    qty: qty || existingProduct.qty,
                    productDetails: {
                        hardwired_unit: hardwired_unit || existingProduct.productDetails.hardwired_unit,
                        hardwired_len_overall: hardwired_len_overall || existingProduct.productDetails.hardwired_len_overall,
                        hardwired_wid_overall: hardwired_wid_overall || existingProduct.productDetails.hardwired_wid_overall,
                        hardwired_height_overall: hardwired_height_overall || existingProduct.productDetails.hardwired_height_overall,
                        hardwired_len_fixture: hardwired_len_fixture || existingProduct.productDetails.hardwired_len_fixture,
                        hardwired_wid_fixture: hardwired_wid_fixture || existingProduct.productDetails.hardwired_wid_fixture,
                        hardwired_height_fixture: hardwired_height_fixture || existingProduct.productDetails.hardwired_height_fixture,
                        hardwired_len_shade: hardwired_len_shade || existingProduct.productDetails.hardwired_len_shade,
                        hardwired_wid_shade: hardwired_wid_shade || existingProduct.productDetails.hardwired_wid_shade,
                        hardwired_height_shade: hardwired_height_shade || existingProduct.productDetails.hardwired_height_shade,
                        hardwired_color: hardwired_color || existingProduct.productDetails.hardwired_color,
                        hardwired_finish: hardwired_finish || existingProduct.productDetails.hardwired_finish,
                        hardwired_base_material: hardwired_base_material || existingProduct.productDetails.hardwired_base_material,
                        hardwired_shade_material: hardwired_shade_material || existingProduct.productDetails.hardwired_shade_material,
                        hardwired_shade_type: hardwired_shade_type || existingProduct.productDetails.hardwired_shade_type,
                        hardwired_switch_type: hardwired_switch_type || existingProduct.productDetails.hardwired_switch_type,
                        hardwired_quantity: hardwired_quantity || existingProduct.productDetails.hardwired_quantity,
                        hardwired_socket_type: hardwired_socket_type || existingProduct.productDetails.hardwired_socket_type,
                        hardwired_dimmable: hardwired_dimmable || existingProduct.productDetails.hardwired_dimmable,
                        hardwired_switch: hardwired_switch || existingProduct.productDetails.hardwired_switch,
                        hardwired_wattaga: hardwired_wattaga || existingProduct.productDetails.hardwired_wattaga,
                        hardwired_temperature: hardwired_temperature || existingProduct.productDetails.hardwired_temperature,
                        hardwired_rating: hardwired_rating || existingProduct.productDetails.hardwired_rating,
                        hardwired: hardwired || existingProduct.productDetails.hardwired,                                                                                                                                                                          
                    },
                    imageUrl: imageUrl || existingProduct.imageUrl
                },
                { new: true, runValidators: true }
            );
        }else  if (furnishing == 'Decorative Lighting'){
            const updatedProduct = await Products.findByIdAndUpdate(
                req.params.id,
                {
                    projectId: projectId || existingProduct.projectId,
                    type: type || existingProduct.type,
                    title: name || existingProduct.title,
                    code: code || existingProduct.code,
                    sku: sku || existingProduct.sku,
                    furnishing: furnishing || existingProduct.furnishing,
                    vendor: vendor || existingProduct.vendor,
                    rfq: rfq || existingProduct.rfq,
                    net_cost: net_cost || existingProduct.net_cost,
                    shipping_cost: shipping_cost || existingProduct.shipping_cost,
                    other_cost: other_cost || existingProduct.other_cost,
                    po_amount: po_amount || existingProduct.po_amount,
                    buy_tax: buy_tax || existingProduct.buy_tax,
                    buy_sales_tax: buy_sales_tax || existingProduct.buy_sales_tax,
                    sell_markup: sell_markup || existingProduct.sell_markup,
                    client_product_cost: client_product_cost || existingProduct.client_product_cost,
                    client_price: client_price || existingProduct.client_price,
                    sell_tax: sell_tax || existingProduct.sell_tax,
                    sell_sales_tax: sell_sales_tax || existingProduct.sell_sales_tax,
                    qty: qty || existingProduct.qty,
                    productDetails: {
                        decorative_lighting_unit: decorative_lighting_unit || existingProduct.productDetails.decorative_lighting_unit,
                        decorative_lighting_len_overall: decorative_lighting_len_overall || existingProduct.productDetails.decorative_lighting_len_overall,
                        decorative_lighting_wid_overall: decorative_lighting_wid_overall || existingProduct.productDetails.decorative_lighting_wid_overall,
                        decorative_lighting_height_overall: decorative_lighting_height_overall || existingProduct.productDetails.decorative_lighting_height_overall,
                        decorative_lighting_len_fixture: decorative_lighting_len_fixture || existingProduct.productDetails.decorative_lighting_len_fixture,
                        decorative_lighting_wid_fixture: decorative_lighting_wid_fixture || existingProduct.productDetails.decorative_lighting_wid_fixture,
                        decorative_lighting_height_fixture: decorative_lighting_height_fixture || existingProduct.productDetails.decorative_lighting_height_fixture,
                        decorative_lighting_len_shade: decorative_lighting_len_shade || existingProduct.productDetails.decorative_lighting_len_shade,
                        decorative_lighting_wid_shade: decorative_lighting_wid_shade || existingProduct.productDetails.decorative_lighting_wid_shade,
                        decorative_lighting_height_shade: decorative_lighting_height_shade || existingProduct.productDetails.decorative_lighting_height_shade,
                        decorative_lighting_color: decorative_lighting_color || existingProduct.productDetails.decorative_lighting_color,
                        decorative_lighting_finish: decorative_lighting_finish || existingProduct.productDetails.decorative_lighting_finish,
                        decorative_lighting_base_material: decorative_lighting_base_material || existingProduct.productDetails.decorative_lighting_base_material,
                        decorative_lighting_shade_material: decorative_lighting_shade_material || existingProduct.productDetails.decorative_lighting_shade_material,
                        decorative_lighting_shade_type: decorative_lighting_shade_type || existingProduct.productDetails.decorative_lighting_shade_type,
                        decorative_lighting_switch_type: decorative_lighting_switch_type || existingProduct.productDetails.decorative_lighting_switch_type,
                        decorative_lighting_quantity: decorative_lighting_quantity || existingProduct.productDetails.decorative_lighting_quantity,
                        decorative_lighting_socket_type: decorative_lighting_socket_type || existingProduct.productDetails.decorative_lighting_socket_type,
                        decorative_lighting_dimmable: decorative_lighting_dimmable || existingProduct.productDetails.decorative_lighting_dimmable,
                        decorative_lighting_switch: decorative_lighting_switch || existingProduct.productDetails.decorative_lighting_switch,
                        decorative_lighting_wattaga: decorative_lighting_wattaga || existingProduct.productDetails.decorative_lighting_wattaga,
                        decorative_lighting_temperature: decorative_lighting_temperature || existingProduct.productDetails.decorative_lighting_temperature,
                        decorative_lighting_rating: decorative_lighting_rating || existingProduct.productDetails.decorative_lighting_rating,                                                                                                                                                                                              
                    },
                    imageUrl: imageUrl || existingProduct.imageUrl
                },
                { new: true, runValidators: true }
            );
        }else  if (furnishing == 'Mirror'){
            const updatedProduct = await Products.findByIdAndUpdate(
                req.params.id,
                {
                    projectId: projectId || existingProduct.projectId,
                    type: type || existingProduct.type,
                    title: name || existingProduct.title,
                    code: code || existingProduct.code,
                    sku: sku || existingProduct.sku,
                    furnishing: furnishing || existingProduct.furnishing,
                    vendor: vendor || existingProduct.vendor,
                    rfq: rfq || existingProduct.rfq,
                    net_cost: net_cost || existingProduct.net_cost,
                    shipping_cost: shipping_cost || existingProduct.shipping_cost,
                    other_cost: other_cost || existingProduct.other_cost,
                    po_amount: po_amount || existingProduct.po_amount,
                    buy_tax: buy_tax || existingProduct.buy_tax,
                    buy_sales_tax: buy_sales_tax || existingProduct.buy_sales_tax,
                    sell_markup: sell_markup || existingProduct.sell_markup,
                    client_product_cost: client_product_cost || existingProduct.client_product_cost,
                    client_price: client_price || existingProduct.client_price,
                    sell_tax: sell_tax || existingProduct.sell_tax,
                    sell_sales_tax: sell_sales_tax || existingProduct.sell_sales_tax,
                    qty: qty || existingProduct.qty,
                    productDetails: {
                        mirror_unit: mirror_unit || existingProduct.productDetails.mirror_unit,
                        mirror_len: mirror_len || existingProduct.productDetails.mirror_len,
                        mirror_wid: mirror_wid || existingProduct.productDetails.mirror_wid,
                        mirror_height: mirror_height || existingProduct.productDetails.mirror_height,
                        mirror_color: mirror_color || existingProduct.productDetails.mirror_color,
                        mirror_finish: mirror_finish || existingProduct.productDetails.mirror_finish,
                        mirror_orientation: mirror_orientation || existingProduct.productDetails.mirror_orientation,
                        mirror_glass: mirror_glass || existingProduct.productDetails.mirror_glass, 
                        mirror_mounting_hardware: mirror_mounting_hardware || existingProduct.productDetails.mirror_mounting_hardware,                                                                                                                                                                                                                  
                    },
                    imageUrl: imageUrl || existingProduct.imageUrl
                },
                { new: true, runValidators: true }
            );
        }else  if (furnishing == 'Miscellaneous'){
            const updatedProduct = await Products.findByIdAndUpdate(
                req.params.id,
                {
                    projectId: projectId || existingProduct.projectId,
                    type: type || existingProduct.type,
                    title: name || existingProduct.title,
                    code: code || existingProduct.code,
                    sku: sku || existingProduct.sku,
                    furnishing: furnishing || existingProduct.furnishing,
                    vendor: vendor || existingProduct.vendor,
                    rfq: rfq || existingProduct.rfq,
                    net_cost: net_cost || existingProduct.net_cost,
                    shipping_cost: shipping_cost || existingProduct.shipping_cost,
                    other_cost: other_cost || existingProduct.other_cost,
                    po_amount: po_amount || existingProduct.po_amount,
                    buy_tax: buy_tax || existingProduct.buy_tax,
                    buy_sales_tax: buy_sales_tax || existingProduct.buy_sales_tax,
                    sell_markup: sell_markup || existingProduct.sell_markup,
                    client_product_cost: client_product_cost || existingProduct.client_product_cost,
                    client_price: client_price || existingProduct.client_price,
                    sell_tax: sell_tax || existingProduct.sell_tax,
                    sell_sales_tax: sell_sales_tax || existingProduct.sell_sales_tax,
                    qty: qty || existingProduct.qty,
                    productDetails: {
                        miscellaneous_fabrication_style: miscellaneous_fabrication_style || existingProduct.productDetails.miscellaneous_fabrication_style,
                        miscellaneous_pattern: miscellaneous_pattern || existingProduct.productDetails.miscellaneous_pattern,
                        miscellaneous_insert: miscellaneous_insert || existingProduct.productDetails.miscellaneous_insert,                                                                                                                                                                                                                                      
                    },
                    imageUrl: imageUrl || existingProduct.imageUrl
                },
                { new: true, runValidators: true }
            );
        }else  if (furnishing == 'Table'){
            const updatedProduct = await Products.findByIdAndUpdate(
                req.params.id,
                {
                    projectId: projectId || existingProduct.projectId,
                    type: type || existingProduct.type,
                    title: name || existingProduct.title,
                    code: code || existingProduct.code,
                    sku: sku || existingProduct.sku,
                    furnishing: furnishing || existingProduct.furnishing,
                    vendor: vendor || existingProduct.vendor,
                    rfq: rfq || existingProduct.rfq,
                    net_cost: net_cost || existingProduct.net_cost,
                    shipping_cost: shipping_cost || existingProduct.shipping_cost,
                    other_cost: other_cost || existingProduct.other_cost,
                    po_amount: po_amount || existingProduct.po_amount,
                    buy_tax: buy_tax || existingProduct.buy_tax,
                    buy_sales_tax: buy_sales_tax || existingProduct.buy_sales_tax,
                    sell_markup: sell_markup || existingProduct.sell_markup,
                    client_product_cost: client_product_cost || existingProduct.client_product_cost,
                    client_price: client_price || existingProduct.client_price,
                    sell_tax: sell_tax || existingProduct.sell_tax,
                    sell_sales_tax: sell_sales_tax || existingProduct.sell_sales_tax,
                    qty: qty || existingProduct.qty,
                    productDetails: {
                        table_unit: table_unit || existingProduct.productDetails.table_unit,
                        table_len: table_len || existingProduct.productDetails.table_len,
                        table_wid: table_wid || existingProduct.productDetails.table_wid,
                        table_height: table_height || existingProduct.productDetails.table_height,
                        table_other_dimension: table_other_dimension || existingProduct.productDetails.table_other_dimension,
                        table_top: table_top || existingProduct.productDetails.table_top,
                        table_finish: table_finish || existingProduct.productDetails.table_finish,
                        table_hardware: table_hardware || existingProduct.productDetails.table_hardware,                                                                                                                                                                                                                                                          
                    },
                    imageUrl: imageUrl || existingProduct.imageUrl
                },
                { new: true, runValidators: true }
            );
        }else  if (furnishing == 'Seating'){
            const updatedProduct = await Products.findByIdAndUpdate(
                req.params.id,
                {
                    projectId: projectId || existingProduct.projectId,
                    type: type || existingProduct.type,
                    title: name || existingProduct.title,
                    code: code || existingProduct.code,
                    sku: sku || existingProduct.sku,
                    furnishing: furnishing || existingProduct.furnishing,
                    vendor: vendor || existingProduct.vendor,
                    rfq: rfq || existingProduct.rfq,
                    net_cost: net_cost || existingProduct.net_cost,
                    shipping_cost: shipping_cost || existingProduct.shipping_cost,
                    other_cost: other_cost || existingProduct.other_cost,
                    po_amount: po_amount || existingProduct.po_amount,
                    buy_tax: buy_tax || existingProduct.buy_tax,
                    buy_sales_tax: buy_sales_tax || existingProduct.buy_sales_tax,
                    sell_markup: sell_markup || existingProduct.sell_markup,
                    client_product_cost: client_product_cost || existingProduct.client_product_cost,
                    client_price: client_price || existingProduct.client_price,
                    sell_tax: sell_tax || existingProduct.sell_tax,
                    sell_sales_tax: sell_sales_tax || existingProduct.sell_sales_tax,
                    qty: qty || existingProduct.qty,
                    productDetails: {
                        seating_unit: seating_unit || existingProduct.productDetails.seating_unit,
                        seating_len: seating_len || existingProduct.productDetails.seating_len,
                        seating_wid: seating_wid || existingProduct.productDetails.seating_wid,
                        seating_height: seating_height || existingProduct.productDetails.seating_height,
                        seating_color: seating_color || existingProduct.productDetails.seating_color,
                        seating_finish: seating_finish || existingProduct.productDetails.seating_finish,
                        seating_vendor_provided_fabric: seating_vendor_provided_fabric || existingProduct.productDetails.seating_vendor_provided_fabric,
                        seating_fabric: seating_fabric || existingProduct.productDetails.seating_fabric,
                        seating_com_fabric: seating_com_fabric || existingProduct.productDetails.seating_com_fabric,
                        seating_pattern_name: seating_pattern_name || existingProduct.productDetails.seating_pattern_name,
                        seating_sku: seating_sku || existingProduct.productDetails.seating_sku,
                        seating_width: seating_width || existingProduct.productDetails.seating_width,
                        seating_horizontal: seating_horizontal || existingProduct.productDetails.seating_horizontal,
                        seating_vertical: seating_vertical || existingProduct.productDetails.seating_vertical,
                        seating_content: seating_content || existingProduct.productDetails.seating_content,
                        seating_backing: seating_backing || existingProduct.productDetails.seating_backing,
                        seating_qty: seating_qty || existingProduct.productDetails.seating_qty,                                                                                                                                                                                                                                                                         
                    },
                    imageUrl: imageUrl || existingProduct.imageUrl
                },
                { new: true, runValidators: true }
            );
        }else  if (furnishing == 'Wallpaper'){
            const updatedProduct = await Products.findByIdAndUpdate(
                req.params.id,
                {
                    projectId: projectId || existingProduct.projectId,
                    type: type || existingProduct.type,
                    title: name || existingProduct.title,
                    code: code || existingProduct.code,
                    sku: sku || existingProduct.sku,
                    furnishing: furnishing || existingProduct.furnishing,
                    vendor: vendor || existingProduct.vendor,
                    rfq: rfq || existingProduct.rfq,
                    net_cost: net_cost || existingProduct.net_cost,
                    shipping_cost: shipping_cost || existingProduct.shipping_cost,
                    other_cost: other_cost || existingProduct.other_cost,
                    po_amount: po_amount || existingProduct.po_amount,
                    buy_tax: buy_tax || existingProduct.buy_tax,
                    buy_sales_tax: buy_sales_tax || existingProduct.buy_sales_tax,
                    sell_markup: sell_markup || existingProduct.sell_markup,
                    client_product_cost: client_product_cost || existingProduct.client_product_cost,
                    client_price: client_price || existingProduct.client_price,
                    sell_tax: sell_tax || existingProduct.sell_tax,
                    sell_sales_tax: sell_sales_tax || existingProduct.sell_sales_tax,
                    qty: qty || existingProduct.qty,
                    productDetails: {
                        wallpaper_color: wallpaper_color || existingProduct.productDetails.wallpaper_color,
                        wallpaper_unit: wallpaper_unit || existingProduct.productDetails.wallpaper_unit,
                        wallpaper_width: wallpaper_width || existingProduct.productDetails.wallpaper_width,
                        wallpaper_horizontal: wallpaper_horizontal || existingProduct.productDetails.wallpaper_horizontal,
                        wallpaper_vertical: wallpaper_vertical || existingProduct.productDetails.wallpaper_vertical,
                        wallpaper_content: wallpaper_content || existingProduct.productDetails.wallpaper_content,
                        wallpaper_type: wallpaper_type || existingProduct.productDetails.wallpaper_type,
                        wallpaper_weight: wallpaper_weight || existingProduct.productDetails.wallpaper_weight,
                        wallpaper_backing: wallpaper_backing || existingProduct.productDetails.wallpaper_backing,
                        wallpaper_installation: wallpaper_installation || existingProduct.productDetails.wallpaper_installation,                                                                                                                                                                                                                                                                                              
                    },
                    imageUrl: imageUrl || existingProduct.imageUrl
                },
                { new: true, runValidators: true }
            );
        }else  if (furnishing == 'Upholstery'){
            const updatedProduct = await Products.findByIdAndUpdate(
                req.params.id,
                {
                    projectId: projectId || existingProduct.projectId,
                    type: type || existingProduct.type,
                    title: name || existingProduct.title,
                    code: code || existingProduct.code,
                    sku: sku || existingProduct.sku,
                    furnishing: furnishing || existingProduct.furnishing,
                    vendor: vendor || existingProduct.vendor,
                    rfq: rfq || existingProduct.rfq,
                    net_cost: net_cost || existingProduct.net_cost,
                    shipping_cost: shipping_cost || existingProduct.shipping_cost,
                    other_cost: other_cost || existingProduct.other_cost,
                    po_amount: po_amount || existingProduct.po_amount,
                    buy_tax: buy_tax || existingProduct.buy_tax,
                    buy_sales_tax: buy_sales_tax || existingProduct.buy_sales_tax,
                    sell_markup: sell_markup || existingProduct.sell_markup,
                    client_product_cost: client_product_cost || existingProduct.client_product_cost,
                    client_price: client_price || existingProduct.client_price,
                    sell_tax: sell_tax || existingProduct.sell_tax,
                    sell_sales_tax: sell_sales_tax || existingProduct.sell_sales_tax,
                    qty: qty || existingProduct.qty,
                    productDetails: {
                        upholstery_color: upholstery_color || existingProduct.productDetails.upholstery_color,
                        upholstery_unit: upholstery_unit || existingProduct.productDetails.upholstery_unit,
                        upholstery_width: upholstery_width || existingProduct.productDetails.upholstery_width,
                        upholstery_horizontal: upholstery_horizontal || existingProduct.productDetails.upholstery_horizontal,
                        upholstery_vertical: upholstery_vertical || existingProduct.productDetails.upholstery_vertical,
                        upholstery_content: upholstery_content || existingProduct.productDetails.upholstery_content,
                        upholstery_backing: upholstery_backing || existingProduct.productDetails.upholstery_backing,
                        upholstery_qty: upholstery_qty || existingProduct.productDetails.upholstery_qty,                                                                                                                                                                                                                                                                                                                    
                    },
                    imageUrl: imageUrl || existingProduct.imageUrl
                },
                { new: true, runValidators: true }
            );
        }else if (furnishing == 'Window Treatment'){
            const updatedProduct = await Products.findByIdAndUpdate(
                req.params.id,
                {
                    projectId: projectId || existingProduct.projectId,
                    type: type || existingProduct.type,
                    title: name || existingProduct.title,
                    code: code || existingProduct.code,
                    sku: sku || existingProduct.sku,
                    furnishing: furnishing || existingProduct.furnishing,
                    vendor: vendor || existingProduct.vendor,
                    rfq: rfq || existingProduct.rfq,
                    net_cost: net_cost || existingProduct.net_cost,
                    shipping_cost: shipping_cost || existingProduct.shipping_cost,
                    other_cost: other_cost || existingProduct.other_cost,
                    po_amount: po_amount || existingProduct.po_amount,
                    buy_tax: buy_tax || existingProduct.buy_tax,
                    buy_sales_tax: buy_sales_tax || existingProduct.buy_sales_tax,
                    sell_markup: sell_markup || existingProduct.sell_markup,
                    client_product_cost: client_product_cost || existingProduct.client_product_cost,
                    client_price: client_price || existingProduct.client_price,
                    sell_tax: sell_tax || existingProduct.sell_tax,
                    sell_sales_tax: sell_sales_tax || existingProduct.sell_sales_tax,
                    qty: qty || existingProduct.qty,
                    productDetails: {
                        wt_unit: wt_unit || existingProduct.productDetails.wt_unit,
                        wt_len_window: wt_len_window || existingProduct.productDetails.wt_len_window,
                        wt_wid_window: wt_wid_window || existingProduct.productDetails.wt_wid_window,
                        wt_height_window: wt_height_window || existingProduct.productDetails.wt_height_window,
                        wt_mount: wt_mount || existingProduct.productDetails.wt_mount,
                        wt_valance: wt_valance || existingProduct.productDetails.wt_valance,
                        wt_vendor_provided_fabric: wt_vendor_provided_fabric || existingProduct.productDetails.wt_vendor_provided_fabric,
                        wt_fabric: wt_fabric || existingProduct.productDetails.wt_fabric,
                        wt_com_fabric: wt_com_fabric || existingProduct.productDetails.wt_com_fabric,
                        wt_pattern_name: wt_pattern_name || existingProduct.productDetails.wt_pattern_name,
                        wt_sku: wt_sku || existingProduct.productDetails.wt_sku,
                        wt_color: wt_color || existingProduct.productDetails.wt_color,
                        wt_horizontal: wt_horizontal || existingProduct.productDetails.wt_horizontal,
                        wt_vertical: wt_vertical || existingProduct.productDetails.wt_vertical,
                        wt_content: wt_content || existingProduct.productDetails.wt_content,
                        wt_backing: wt_backing || existingProduct.productDetails.wt_backing,
                        wt_installation_type: wt_installation_type || existingProduct.productDetails.wt_installation_type,
                        wt_type: wt_type || existingProduct.productDetails.wt_type,
                        wt_drapery_style: wt_drapery_style || existingProduct.productDetails.wt_drapery_style,
                        wt_drapery_fullness: wt_drapery_fullness || existingProduct.productDetails.wt_drapery_fullness,
                        wt_drapery_hem: wt_drapery_hem || existingProduct.productDetails.wt_drapery_hem,
                        wt_drapery_construction: wt_drapery_construction || existingProduct.productDetails.wt_drapery_construction,
                        wt_drapery_control: wt_drapery_control || existingProduct.productDetails.wt_drapery_control,
                        wt_drapery_control_location: wt_drapery_control_location || existingProduct.productDetails.wt_drapery_control_location,
                        wt_drapery_hardware: wt_drapery_hardware || existingProduct.productDetails.wt_drapery_hardware,
                        wt_drapery_blackout_linear: wt_drapery_blackout_linear || existingProduct.productDetails.wt_drapery_blackout_linear,
                        wt_shade_style: wt_shade_style || existingProduct.productDetails.wt_shade_style,
                        wt_shade_fullness: wt_shade_fullness || existingProduct.productDetails.wt_shade_fullness,
                        wt_shade_hem: wt_shade_hem || existingProduct.productDetails.wt_shade_hem,
                        wt_shade_construction: wt_shade_construction || existingProduct.productDetails.wt_shade_construction,
                        wt_shade_control_type: wt_shade_control_type || existingProduct.productDetails.wt_shade_control_type,
                        wt_shade_control_location: wt_shade_control_location || existingProduct.productDetails.wt_shade_control_location,
                        wt_shade_hardware: wt_shade_hardware || existingProduct.productDetails.wt_shade_hardware,
                        wt_shade_blackout_linear: wt_shade_blackout_linear || existingProduct.productDetails.wt_shade_blackout_linear,
                                                                                                                                                                                                                                                                                                                                       
                    },
                    imageUrl: imageUrl || existingProduct.imageUrl
                },
                { new: true, runValidators: true }
            );
        }
        
        



        res.status(200).json({ message: 'Product updated successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error updating product', error: error.message });
    }
});

router.delete('/product/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const pdt = await Products.findById(id);
        if (!pdt) {
            return res.status(404).json({ message: 'Item not found' });
        }

        await Products.deleteOne({ _id: id });

        if (pdt.type === 'Product') {
            const inpdts = await InPdts.findOne({ productID: id });

            if (!inpdts) {
                return res.status(404).json({ message: 'Inventory item not found' });
            }

            await InPdts.deleteOne({ productID: id });
        }

        res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

//For procurement
router.get('/products/:secId', auth, async (req, res) => {
    const { secId } = req.params;

    try {
        const sections = await Sections.find({ projectId: secId });

        const sectionIds = sections.map(section => section._id);

        const products = await Products.find({ projectId: { $in: sectionIds } });

        res.status(200).json({ products });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

router.put('/updateQty/:id', async (req, res) => {
    const { id } = req.params;
    const { qty } = req.body;

    try {
        const pdt = await Products.findById(id);
        if (!pdt) {
            return res.status(404).json({ message: 'Product not found' });
        }
        // pdt.productDetails.qty = qty;
        await pdt.save();
        res.status(200).json({ message: 'Quantity updated successfully' });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

router.get('/findProducts-out/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        const sections = await Sections.find({ projectId: id });

        if (!sections.length) {
            return res.status(404).json({ message: 'No sections found for this projectId' });
        }

        const sectionIds = sections.map(section => section._id);

        const products = await Products.find({ projectId: { $in: sectionIds } });

        if (!products.length) {
            return res.status(404).json({ message: 'No products found for these sections' });
        }

        const enrichedProducts = await Promise.all(products.map(async (product) => {
            const inPdt = await InPdts.findOne({ productID: product._id.toString() });
            return {
                ...product._doc,
                totQty: inPdt ? inPdt.totQty : 0
            };
        }));

        res.status(200).json(enrichedProducts);
    } catch (error) {
        console.error('Error finding products:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/outDocs', auth, async (req, res) => {
    try {
        const docs = await OutDocs.find();
        res.status(200).json(docs);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

router.put('/updateOutDoc', async (req, res) => {
    try {
        const {
            array,
            docNum,
            projectId,
            reason,
            products
        } = req.body;

        await Promise.all(array.map(async (item) => {
            const { pdtid, qty } = item;

            const inPdt = await InPdts.findOne({ productID: pdtid });

            if (inPdt) {
                inPdt.totQty = Number(inPdt.totQty) - Number(qty);
                await inPdt.save();
            } else {
                return res.status(404).json({ message: `Product with ID ${pdtid} not found!` });
            }
        }));

        const prj = await Sales.findById(projectId);

        const newDoc = new OutDocs({
            docNum, projectName: prj.name, reason, products
        });

        await newDoc.save();

        res.status(200).json({ message: 'Inventory updated successfully' });
    } catch (error) {
        console.error('Error updating quantities:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

router.put('/updatePdtStatus/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const pdt = await Products.findById(id);

        if (!pdt) {
            return res.status(404).json({ message: 'Product not found' });
        }

        pdt.status = status || pdt.status;

        await pdt.save();

        res.status(200).json({ message: 'Status updated successfully' });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ message: 'Error updating status:', error });
    }
});

router.get('/viewOutDoc/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid document ID" });
        }

        const doc = await OutDocs.findOne({ _id: id });

        if (!doc) {
            return res.status(404).json({ message: "Document not found!" });
        }

        const productIds = doc.products.map(product => product.pdtid);

        const productsDetails = await Products.find({ _id: { $in: productIds } });

        const response = doc.products.map(product => {
            const productDetail = productsDetails.find(pd => pd._id.toString() === product.pdtid);
            return {
                ...productDetail._doc,
                outQty: product.qty
            };
        });

        res.status(200).json(response);
    } catch (error) {
        console.error('Server error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/getInvPdts', auth, async (req, res) => {
    try {
        const pdts = await InPdts.find();

        const pdtIds = pdts.map(pdt => pdt.productID);

        const products = await Products.find({ _id: { $in: pdtIds } });

        const pdtArray = pdts.map(pdt => {
            const productDetail = products.find(pd => pd._id.toString() === pdt.productID);
            return {
                ...productDetail._doc,
                totQty: pdt.totQty
            };
        });

        res.status(200).json(pdtArray);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

router.put('/update-invQty', async (req, res) => {
    try {
        const { docNum, reason, products } = req.body;

        for (const product of products) {
            await InPdts.findOneAndUpdate(
                { productID: product.pdtid },
                { $set: { totQty: product.qty } },
                { new: true, upsert: false }
            );
        }

        const newDoc = new StockAdjDocs({ docNum, reason, products });

        await newDoc.save();

        res.status(200).json({ message: 'Quantities updated successfully' });
    } catch (error) {
        console.error('Error updating quantities:', error);
        res.status(500).json({ error: 'Failed to update quantities' });
    }
});

router.get('/getStockAdjDocs', auth, async (req, res) => {
    try {
        const docs = await StockAdjDocs.find();
        res.status(200).json(docs);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

router.get('/viewSADoc/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid document ID" });
        }

        const doc = await StockAdjDocs.findOne({ _id: id });

        if (!doc) {
            return res.status(404).json({ message: "Document not found!" });
        }

        const productIds = doc.products.map(product => product.pdtid);

        const productsDetails = await Products.find({ _id: { $in: productIds } });

        const response = doc.products.map(product => {
            const productDetail = productsDetails.find(pd => pd._id.toString() === product.pdtid);
            return {
                ...productDetail._doc,
                qty: product.qty
            };
        });

        res.status(200).json(response);
    } catch (error) {
        console.error('Server error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/calculate-revenue', auth, async (req, res) => {
    try {
      const inPdts = await InPdts.find();
  
      let totalCost = 0;

      for (const inPdt of inPdts) {
        const product = await Products.findById(inPdt.productID);
  
        if (product) {
          totalCost += inPdt.totQty * product.productDetails.sellCost;
        }
      }
  
      res.status(200).json(totalCost);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });

module.exports = router;