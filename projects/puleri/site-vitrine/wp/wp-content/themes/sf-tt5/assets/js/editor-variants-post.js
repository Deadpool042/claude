
(function (wp) {
  if (!wp || !wp.hooks || !wp.compose || !wp.element || !wp.blockEditor || !wp.components || !wp.data) return;

  var addFilter = wp.hooks.addFilter;
  var createHigherOrderComponent = wp.compose.createHigherOrderComponent;
  var Fragment = wp.element.Fragment;
  var BlockControls = wp.blockEditor.BlockControls;
  var InspectorControls = wp.blockEditor.InspectorControls;
  var ToolbarGroup = wp.components.ToolbarGroup;
  var ToolbarDropdownMenu = wp.components.ToolbarDropdownMenu;
  var PanelBody = wp.components.PanelBody;
  var SelectControl = wp.components.SelectControl;
  var dataDispatch = wp.data.dispatch;
  var dataSelect = wp.data.select;
  var dataSubscribe = wp.data.subscribe;

  addFilter("blocks.registerBlockType", "sf-tt5/hide-template-part-inserter", function (settings, name) {
    if (name !== "core/template-part") return settings;
    var supports = Object.assign({}, settings.supports, { inserter: false });
    return Object.assign({}, settings, { supports: supports });
  });

  var headers = [
    { title: "Header - Default (SF)", slug: "header-default" },
    { title: "Header - Centered (SF)", slug: "header-centered" },
    { title: "Header - Custom (SF)", slug: "header-custom" },
    { title: "Header - Split (SF)", slug: "header-split" },
  ];
  var footers = [
    { title: "Footer - Default (SF)", slug: "footer" },
    { title: "Footer - Compact (SF)", slug: "footer-compact" },
    { title: "Footer - Columns (SF)", slug: "footer-columns" },
    { title: "Footer - Newsletter (SF)", slug: "footer-newsletter" },
  ];

  function buildOptions(list) {
    return list.map(function (entry) {
      return { label: entry.title, value: entry.slug };
    });
  }

  function getPostContext() {
    var editorSelect = dataSelect("core/editor");
    if (!editorSelect || !editorSelect.getCurrentPostType) return null;
    var postType = editorSelect.getCurrentPostType();
    var postId = editorSelect.getCurrentPostId ? editorSelect.getCurrentPostId() : null;
    if (!postType || !postId) return null;
    return { postType: postType, postId: postId };
  }

  function getMetaValue(key) {
    var editorSelect = dataSelect("core/editor");
    if (editorSelect && editorSelect.getEditedPostAttribute) {
      var meta = editorSelect.getEditedPostAttribute("meta");
      if (meta && Object.prototype.hasOwnProperty.call(meta, key)) {
        return meta[key];
      }
    }

    var ctx = getPostContext();
    if (!ctx) return null;
    var entity = dataSelect("core").getEntityRecord("postType", ctx.postType, ctx.postId);
    if (entity && entity.meta && Object.prototype.hasOwnProperty.call(entity.meta, key)) {
      return entity.meta[key];
    }

    return null;
  }

  function updateTemplatePartBlocks(area, slug) {
    var blocks = dataSelect("core/block-editor").getBlocks();
    var dispatcher = dataDispatch("core/block-editor");
    var didUpdate = false;

    function walk(items) {
      items.forEach(function (block) {
        if (block.name === "core/template-part") {
          var attrs = block.attributes || {};
          var currentSlug = attrs.slug || "";
          var isHeader =
            attrs.area === "header" ||
            currentSlug === "header" ||
            (typeof currentSlug === "string" && currentSlug.indexOf("header-") === 0);
          var isFooter =
            attrs.area === "footer" ||
            currentSlug === "footer" ||
            (typeof currentSlug === "string" && currentSlug.indexOf("footer-") === 0);
          if ((area === "header" && isHeader) || (area === "footer" && isFooter)) {
            dispatcher.updateBlockAttributes(block.clientId, {
              slug: slug,
              area: area,
              tagName: area,
            });
            didUpdate = true;
          }
        }
        if (block.innerBlocks && block.innerBlocks.length) {
          walk(block.innerBlocks);
        }
      });
    }

    walk(blocks);
    return didUpdate;
  }

  function setVariantMeta(area, slug) {
    var editor = dataDispatch("core/editor");
    if (editor && editor.editPost) {
      var key = area === "header" ? "sf_tt5_header_variant" : "sf_tt5_footer_variant";
      editor.editPost({ meta: { [key]: slug } });
    }

    var ctx = getPostContext();
    if (!ctx) return;
    var core = dataDispatch("core");
    if (core && core.editEntityRecord) {
      var metaKey = area === "header" ? "sf_tt5_header_variant" : "sf_tt5_footer_variant";
      core.editEntityRecord("postType", ctx.postType, ctx.postId, { meta: { [metaKey]: slug } });
      if (core.saveEditedEntityRecord) {
        core.saveEditedEntityRecord("postType", ctx.postType, ctx.postId);
      } else if (core.saveEntityRecord) {
        core.saveEntityRecord("postType", ctx.postType, ctx.postId, { isAutosave: false });
      }
    } else if (editor && editor.savePost) {
      editor.savePost();
    }

    if (editor && editor.savePost) {
      editor.savePost();
    }
  }

  var withTemplatePartReplace = createHigherOrderComponent(function (BlockEdit) {
    return function (props) {
      if (props.name !== "core/template-part") {
        return wp.element.createElement(BlockEdit, props);
      }

      var attrs = props.attributes || {};
      var slug = attrs.slug || "";
      var isHeader =
        attrs.area === "header" ||
        slug === "header" ||
        (typeof slug === "string" && slug.indexOf("header-") === 0);
      var isFooter =
        attrs.area === "footer" ||
        slug === "footer" ||
        (typeof slug === "string" && slug.indexOf("footer-") === 0);
      if (!isHeader && !isFooter) {
        return wp.element.createElement(BlockEdit, props);
      }

      var items = isHeader ? headers : footers;
      var controls = items.map(function (entry) {
        return {
          title: entry.title,
          icon: "admin-appearance",
          isActive: attrs.slug === entry.slug,
          onClick: function () {
            props.setAttributes({
              slug: entry.slug,
              area: isHeader ? "header" : "footer",
              tagName: isHeader ? "header" : "footer",
            });
            updateTemplatePartBlocks(isHeader ? "header" : "footer", entry.slug);
            setVariantMeta(isHeader ? "header" : "footer", entry.slug);
          },
        };
      });

      var options = buildOptions(items);
      var panelTitle = isHeader ? "Header (SF)" : "Footer (SF)";

      return wp.element.createElement(
        Fragment,
        null,
        wp.element.createElement(BlockEdit, props),
        wp.element.createElement(
          BlockControls,
          null,
          wp.element.createElement(
            ToolbarGroup,
            null,
            wp.element.createElement(ToolbarDropdownMenu, {
              icon: "update",
              label: "Remplacer",
              controls: controls,
            })
          )
        ),
        wp.element.createElement(
          InspectorControls,
          null,
          wp.element.createElement(
            PanelBody,
            { title: panelTitle, initialOpen: true },
            wp.element.createElement(SelectControl, {
              label: "Variante",
              value: slug || (isHeader ? "header-default" : "footer"),
              options: options,
              __next40pxDefaultSize: true,
              __nextHasNoMarginBottom: true,
              onChange: function (nextSlug) {
                props.setAttributes({
                  slug: nextSlug,
                  area: isHeader ? "header" : "footer",
                  tagName: isHeader ? "header" : "footer",
                });
                updateTemplatePartBlocks(isHeader ? "header" : "footer", nextSlug);
                setVariantMeta(isHeader ? "header" : "footer", nextSlug);
              },
            })
          )
        )
      );
    };
  }, "withTemplatePartReplace");

  addFilter("editor.BlockEdit", "sf-tt5/template-part-replace", withTemplatePartReplace);

  if (dataSubscribe && dataSelect) {
    var last = { header: null, footer: null };
    var isApplying = false;
    dataSubscribe(function () {
      if (isApplying) return;
      var headerVariant = getMetaValue("sf_tt5_header_variant") || null;
      var footerVariant = getMetaValue("sf_tt5_footer_variant") || null;
      if (headerVariant && headerVariant !== last.header) {
        isApplying = true;
        var updatedHeader = updateTemplatePartBlocks("header", headerVariant);
        if (updatedHeader) {
          last.header = headerVariant;
        }
        isApplying = false;
      }
      if (footerVariant && footerVariant !== last.footer) {
        isApplying = true;
        var updatedFooter = updateTemplatePartBlocks("footer", footerVariant);
        if (updatedFooter) {
          last.footer = footerVariant;
        }
        isApplying = false;
      }
    });
  }
})(window.wp);
