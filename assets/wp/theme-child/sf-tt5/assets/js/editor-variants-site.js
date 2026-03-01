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

  function getUrlPostContext() {
    if (typeof window === "undefined" || !window.location || !window.location.search) return null;
    var params = new URLSearchParams(window.location.search);
    var postType = params.get("postType");
    var postId = params.get("postId");
    if (!postType) {
      var p = params.get("p");
      if (p === "/page") postType = "page";
      if (p === "/post") postType = "post";
    }
    if (!postType || !postId) return null;
    if (postType !== "post" && postType !== "page") return null;
    var id = parseInt(postId, 10);
    if (!id) return null;
    return { postType: postType, postId: id };
  }

  function getEditorContext() {
    var editorSelect = dataSelect("core/editor");
    var postType =
      editorSelect && editorSelect.getCurrentPostType ? editorSelect.getCurrentPostType() : null;
    var postId = editorSelect && editorSelect.getCurrentPostId ? editorSelect.getCurrentPostId() : null;
    if (postType && postId) {
      return { postType: postType, postId: postId };
    }
    return getUrlPostContext();
  }

  function setVariantMeta(area, slug) {
    var ctx = getEditorContext();
    if (!ctx) return;
    var key = area === "header" ? "sf_tt5_header_variant" : "sf_tt5_footer_variant";
    var core = dataDispatch("core");
    if (!core || !core.saveEntityRecord) return;
    core.saveEntityRecord("postType", ctx.postType, { id: ctx.postId, meta: { [key]: slug } });
  }

  function saveEditedEntity() {
    var editSiteDispatch = dataDispatch("core/edit-site");
    if (editSiteDispatch && editSiteDispatch.saveEditedEntityRecord) {
      editSiteDispatch.saveEditedEntityRecord();
      return;
    }

    var editorSelect = dataSelect("core/editor");
    var postType =
      editorSelect && editorSelect.getCurrentPostType ? editorSelect.getCurrentPostType() : null;
    var postId = editorSelect && editorSelect.getCurrentPostId ? editorSelect.getCurrentPostId() : null;

    if (!postType || !postId) return;

    var core = dataDispatch("core");
    if (core && core.saveEditedEntityRecord) {
      core.saveEditedEntityRecord("postType", postType, postId);
      return;
    }
    if (core && core.saveEntityRecord) {
      core.saveEntityRecord("postType", postType, postId, { isAutosave: false });
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
            saveEditedEntity();
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
                saveEditedEntity();
              },
            })
          )
        )
      );
    };
  }, "withTemplatePartReplace");

  addFilter("editor.BlockEdit", "sf-tt5/template-part-replace", withTemplatePartReplace);
})(window.wp);
