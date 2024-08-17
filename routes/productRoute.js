const express = require('express');
const Products = require('../models/Product.js');
const Sections = require('../models/Section.js');
const auth = require('../utils/jwtUtils.js');

const router = express.Router();

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
        projectId, type, name, code, qty, imageUrl, furnishing, acessory_unit, acessory_len, acessory_wid, acessory_height, 
        acessory_color, acessory_finish, arearug_unit, arearug_len, arearug_wid, arearug_rugpad, arearug_content, 
        arearug_color, arearug_gauge, arearug_pile, arearug_stitches, arearug_pattern, arearug_construction, arearug_backing, 
        arearug_secondaryBacking, equipment_unit, equipment_len, equipment_wid, equipment_height, equipment_color, 
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
        }
        else if (furnishing == 'Area Rug'){
            const newProduct = new Products({
                projectId,
                type,
                title: name,
                code,
                qty,
                productDetails: {
                    arearug_unit: arearug_unit,
                    arearug_len: arearug_len,
                    arearug_wid: arearug_wid,
                    arearug_rugpad: arearug_rugpad,
                    arearug_content: arearug_content,
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
        }        
        else if (furnishing == 'Equipment'){
            const newProduct = new Products({
                projectId,
                type,
                title: name,
                code,
                qty,
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
        }  
        else if (furnishing == 'Hardware'){
            const newProduct = new Products({
                projectId,
                type,
                title: name,
                code,
                qty,
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
        }        
        else if (furnishing == 'Artwork'){
            const newProduct = new Products({
                projectId,
                type,
                title: name,
                code,
                qty,
                productDetails: {
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
        }   
        else if (furnishing == 'Casegood'){
            const newProduct = new Products({
                projectId,
                type,
                title: name,
                code,
                qty,
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
        }
        else if (furnishing == 'Fabric'){
            const newProduct = new Products({
                projectId,
                type,
                title: name,
                code,
                qty,
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
        }
        else if (furnishing == 'Light Fixture (hardwired)'){
            const newProduct = new Products({
                projectId,
                type,
                title: name,
                code,
                qty,
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
        }        
        else if (furnishing == 'Decorative Lighting'){
            const newProduct = new Products({
                projectId,
                type,
                title: name,
                code,
                qty,
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
        }   
        else if (furnishing == 'Mirror'){
            const newProduct = new Products({
                projectId,
                type,
                title: name,
                code,
                qty,
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
        }   
        else if (furnishing == 'Miscellaneous'){
            const newProduct = new Products({
                projectId,
                type,
                title: name,
                code,
                qty,
                productDetails: {
                    miscellaneous_fabrication_style: miscellaneous_fabrication_style,
                    miscellaneous_pattern: miscellaneous_pattern,
                    miscellaneous_insert: miscellaneous_insert,                                                                                                                                                                               
                },
                imageUrl
            });
        await newProduct.save();
        }   
        else if (furnishing == 'Table'){
            const newProduct = new Products({
                projectId,
                type,
                title: name,
                code,
                qty,
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
        }
        else if (furnishing == 'Seating'){
            const newProduct = new Products({
                projectId,
                type,
                title: name,
                code,
                qty,
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
        } 
        else if (furnishing == 'Wallpaper'){
            const newProduct = new Products({
                projectId,
                type,
                title: name,
                code,
                qty,
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
        }          
        else if (furnishing == 'Upholstery'){
            const newProduct = new Products({
                projectId,
                type,
                title: name,
                code,
                qty,
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
        }          
        else if (furnishing == 'Window Treatment'){
            const newProduct = new Products({
                projectId,
                type,
                title: name,
                code,
                qty,
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
        projectId, type, name, desc, code, unit, len, wid, dia, color, material,
        insert, finish, qty, vendor, budget, buyCost, sellCost, imageUrl
    } = req.body;

    try {
        const existingProduct = await Products.findById(req.params.id);

        if (!existingProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const updatedProduct = await Products.findByIdAndUpdate(
            req.params.id,
            {
                projectId: projectId || existingProduct.projectId,
                type: type || existingProduct.type,
                title: name || existingProduct.title,
                desc: desc || existingProduct.desc,
                productDetails: {
                    code: code || existingProduct.productDetails.code,
                    unit: unit || existingProduct.productDetails.unit,
                    len: len !== undefined ? len : existingProduct.productDetails.len,
                    wid: wid !== undefined ? wid : existingProduct.productDetails.wid,
                    dia: dia !== undefined ? dia : existingProduct.productDetails.dia,
                    color: color || existingProduct.productDetails.color,
                    material: material || existingProduct.productDetails.material,
                    insert: insert || existingProduct.productDetails.insert,
                    finish: finish || existingProduct.productDetails.finish,
                    qty: qty !== undefined ? qty : existingProduct.productDetails.qty,
                    vendor: vendor || existingProduct.productDetails.vendor,
                    budget: budget !== undefined ? budget : existingProduct.productDetails.budget,
                    buyCost: buyCost !== undefined ? buyCost : existingProduct.productDetails.buyCost,
                    sellCost: sellCost !== undefined ? sellCost : existingProduct.productDetails.sellCost
                },
                imageUrl: imageUrl || existingProduct.imageUrl
            },
            { new: true, runValidators: true }
        );

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

module.exports = router;