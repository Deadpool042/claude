(function (wp) {
  if (!wp || !wp.blocks || !wp.blockEditor || !wp.components || !wp.compose || !wp.element || !wp.data || !wp.hooks) return;

  var registerBlockType = wp.blocks.registerBlockType;
  var registerBlockVariation = wp.blocks.registerBlockVariation;
  var unregisterBlockVariation = wp.blocks.unregisterBlockVariation;
  var createBlock = wp.blocks.createBlock;
  var parseBlocks = wp.blocks.parse;
  var getBlockPatterns = wp.blocks.getBlockPatterns;
  var useBlockProps = wp.blockEditor.useBlockProps;
  var useSelect = wp.data.useSelect;
  var createHigherOrderComponent = wp.compose.createHigherOrderComponent;
  var Fragment = wp.element.Fragment;
  var BlockControls = wp.blockEditor.BlockControls;
  var InspectorControls = wp.blockEditor.InspectorControls;
  var ToolbarGroup = wp.components.ToolbarGroup;
  var ToolbarDropdownMenu = wp.components.ToolbarDropdownMenu;
  var PanelBody = wp.components.PanelBody;
  var SelectControl = wp.components.SelectControl;
  var dataSelect = wp.data.select;
  var dataDispatch = wp.data.dispatch;
  var addFilter = wp.hooks.addFilter;

  var patternCatalog = [
    { slug: "sf-tt5/hero-simple", label: "Composant — Hero simple (SF)" },
    { slug: "sf-tt5/hero-text", label: "Composant — Hero texte (SF)" },
    { slug: "sf-tt5/hero-image-left", label: "Composant — Hero image gauche (SF)" },
    { slug: "sf-tt5/hero-image-right", label: "Composant — Hero image droite (SF)" },
    { slug: "sf-tt5/hero-image-top", label: "Composant — Hero image dessus (SF)" },
    { slug: "sf-tt5/hero-text-top", label: "Composant — Hero texte dessus (SF)" },
    { slug: "sf-tt5/hero-bg-image", label: "Composant — Hero bg image (SF)" },
    { slug: "sf-tt5/hero-bg-slider", label: "Composant — Hero bg slider (SF)" },
    { slug: "sf-tt5/section-full-width", label: "Composant — Full width (SF)" },
    { slug: "sf-tt5/section-text", label: "Composant — Texte (SF)" },
    { slug: "sf-tt5/section-image-left", label: "Composant — Image gauche (SF)" },
    { slug: "sf-tt5/section-image-right", label: "Composant — Image droite (SF)" },
    { slug: "sf-tt5/section-image-top", label: "Composant — Image dessus (SF)" },
    { slug: "sf-tt5/section-text-top", label: "Composant — Texte dessus (SF)" },
    { slug: "sf-tt5/section-cards-2", label: "Composant — Cards 2 (SF)" },
    { slug: "sf-tt5/section-cards-3", label: "Composant — Cards 3 (SF)" },
    { slug: "sf-tt5/section-cards-5", label: "Composant — Cards 5 (SF)" },
  ];

  function getPatternsMap() {
    var patterns = [];
    if (typeof getBlockPatterns === "function") {
      patterns = patterns.concat(getBlockPatterns() || []);
    }
    var coreSelect = dataSelect("core");
    if (coreSelect && typeof coreSelect.getBlockPatterns === "function") {
      var corePatterns = coreSelect.getBlockPatterns();
      if (Array.isArray(corePatterns)) {
        patterns = patterns.concat(corePatterns);
      }
    }
    var map = {};
    patterns.forEach(function (pattern) {
      if (pattern && pattern.name) map[pattern.name] = pattern;
    });
    return map;
  }

  function slugToClass(slug) {
    if (!slug) return "";
    return (
      "sf-section--pattern-" +
      slug
        .replace(/^sf-tt5\//, "")
        .replace(/[^a-z0-9-]+/gi, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase()
    );
  }

  function getPatternSlugFromClass(className) {
    if (typeof className !== "string") return "";
    for (var i = 0; i < patternCatalog.length; i += 1) {
      var entry = patternCatalog[i];
      var token = slugToClass(entry.slug);
      if (token && className.indexOf(token) !== -1) return entry.slug;
    }
    return "";
  }

  function normalizeClassName(className, selectedSlug) {
    var cleaned = (className || "")
      .split(/\s+/)
      .filter(Boolean)
      .filter(function (cls) {
        return cls !== "sf-section" && !cls.startsWith("sf-section--pattern-");
      });
    cleaned.unshift("sf-section");
    var patternClass = slugToClass(selectedSlug);
    if (patternClass) {
      cleaned.push(patternClass);
    }
    return cleaned.join(" ");
  }

  function isSectionBlock(block) {
    if (!block || (block.name !== "core/group" && block.name !== "core/columns")) return false;
    var className = block.attributes ? block.attributes.className : "";
    return typeof className === "string" && className.indexOf("sf-section") !== -1;
  }

  function findSectionTarget(props) {
    if (!props || !props.clientId) return null;
    var store = dataSelect("core/block-editor");
    var current = store.getBlock(props.clientId);
    if (isSectionBlock(current)) return current;
    var parents = store.getBlockParents(props.clientId);
    for (var i = 0; i < parents.length; i += 1) {
      var parentBlock = store.getBlock(parents[i]);
      if (isSectionBlock(parentBlock)) return parentBlock;
    }
    return null;
  }

  function createPlaceholderBlock() {
    return createBlock("sf-tt5/section-placeholder", {});
  }

  function buildSectionBlock(sectionBlock, innerBlocks, selectedSlug) {
    var attrs = (sectionBlock && sectionBlock.attributes) || {};
    var align = attrs.align || "full";
    var slug =
      typeof selectedSlug === "string"
        ? selectedSlug
        : getPatternSlugFromClass(attrs.className || "");
    var className = normalizeClassName(attrs.className || "", slug);
    var layout = attrs.layout ? Object.assign({}, attrs.layout) : { type: "constrained", inherit: false };
    layout.inherit = false;
    return createBlock(
      "core/group",
      { align: align, className: className, layout: layout, sfSectionPattern: slug },
      innerBlocks && innerBlocks.length ? innerBlocks : [createPlaceholderBlock()]
    );
  }

  var migratedSectionIds = {};
  function migrateLegacySection(sectionBlock) {
    if (!sectionBlock || sectionBlock.name !== "core/columns") return sectionBlock;
    if (migratedSectionIds[sectionBlock.clientId]) return sectionBlock;
    migratedSectionIds[sectionBlock.clientId] = true;
    var innerBlocks = [];
    (sectionBlock.innerBlocks || []).forEach(function (column) {
      (column.innerBlocks || []).forEach(function (inner) {
        innerBlocks.push(inner);
      });
    });
    var newBlock = buildSectionBlock(sectionBlock, innerBlocks, "");
    dataDispatch("core/block-editor").replaceBlock(sectionBlock.clientId, newBlock);
    return newBlock;
  }

  function applyLayoutDefaults(blocks) {
    if (!Array.isArray(blocks)) return blocks;
    blocks.forEach(function (block) {
      if (!block || !block.attributes) return;
      if (block.name === "core/group") {
        var layout = block.attributes.layout ? Object.assign({}, block.attributes.layout) : { type: "constrained" };
        layout.inherit = false;
        block.attributes.layout = layout;
      }
      if (block.innerBlocks && block.innerBlocks.length) {
        applyLayoutDefaults(block.innerBlocks);
      }
    });
    return blocks;
  }

  function replaceSectionContent(sectionBlock, slug) {
    if (!sectionBlock || !sectionBlock.clientId) return;
    var innerBlocks = [];
    if (slug) {
      var patternsMap = getPatternsMap();
      var pattern = patternsMap[slug];
      if (pattern && pattern.content) {
        innerBlocks = parseBlocks(pattern.content);
        innerBlocks = applyLayoutDefaults(innerBlocks);
      }
    } else {
      innerBlocks = [createPlaceholderBlock()];
    }
    var newBlock = buildSectionBlock(sectionBlock, innerBlocks, slug || "");
    dataDispatch("core/block-editor").replaceBlock(sectionBlock.clientId, newBlock);
  }

  function registerSectionVariations() {
    if (typeof unregisterBlockVariation === "function") {
      unregisterBlockVariation("core/columns", "sf-section");
      unregisterBlockVariation("core/group", "sf-section");
    }
    registerBlockVariation("core/group", {
      name: "sf-section",
      title: "Section — Layout (SF)",
      description: "Conteneur de layout de section.",
      attributes: {
        align: "full",
        className: "sf-section",
        layout: { type: "constrained", inherit: false },
      },
      innerBlocks: [createPlaceholderBlock()],
      scope: ["inserter", "block"],
      keywords: ["sf", "section"],
      isActive: function (attrs) {
        return typeof attrs.className === "string" && attrs.className.indexOf("sf-section") !== -1;
      },
    });
  }

  addFilter("blocks.registerBlockType", "sf-tt5/section-attrs", function (settings, name) {
    if (name !== "core/group") return settings;
    var attributes = Object.assign({}, settings.attributes, {
      sfSectionPattern: { type: "string", default: "" },
    });
    return Object.assign({}, settings, { attributes: attributes });
  });

  registerBlockType("sf-tt5/section-placeholder", {
    apiVersion: 3,
    title: "Section placeholder (SF)",
    category: "design",
    icon: "layout",
    supports: { inserter: false, reusable: false, html: false },
    edit: function (props) {
      var blockProps = useBlockProps({ className: "sf-section-placeholder" });
      var options =
        typeof useSelect === "function"
          ? useSelect(
              function (select) {
                var patterns = [];
                if (typeof getBlockPatterns === "function") {
                  patterns = patterns.concat(getBlockPatterns() || []);
                }
                var coreSelect = select("core");
                if (coreSelect && typeof coreSelect.getBlockPatterns === "function") {
                  var corePatterns = coreSelect.getBlockPatterns();
                  if (Array.isArray(corePatterns)) {
                    patterns = patterns.concat(corePatterns);
                  }
                }
                var map = {};
                patterns.forEach(function (pattern) {
                  if (pattern && pattern.name) map[pattern.name] = pattern;
                });
                var items = [{ label: "Choisir un composant", value: "" }];
                patternCatalog.forEach(function (entry) {
                  items.push({
                    label: entry.label,
                    value: entry.slug,
                    disabled: !map[entry.slug],
                  });
                });
                return items;
              },
              []
            )
          : [{ label: "Choisir un composant", value: "" }].concat(
              patternCatalog.map(function (entry) {
                return { label: entry.label, value: entry.slug };
              })
            );

      var parentId = typeof useSelect === "function"
        ? useSelect(
        function (select) {
          var parents = select("core/block-editor").getBlockParents(props.clientId);
          for (var i = 0; i < parents.length; i += 1) {
            var parent = select("core/block-editor").getBlock(parents[i]);
            if (isSectionBlock(parent)) return parent.clientId;
          }
          return null;
        },
        [props.clientId]
      )
        : null;

      var currentSlug =
        typeof useSelect === "function"
          ? useSelect(
              function (select) {
                if (!parentId) return "";
                var parent = select("core/block-editor").getBlock(parentId);
                if (!parent || !parent.attributes) return "";
                return (
                  parent.attributes.sfSectionPattern ||
                  getPatternSlugFromClass(parent.attributes.className || "")
                );
              },
              [parentId]
            )
          : "";

      return wp.element.createElement(
        "div",
        blockProps,
        wp.element.createElement(
          "div",
          { className: "sf-section-placeholder__inner" },
          wp.element.createElement(
            "p",
            { className: "sf-section-placeholder__title" },
            "Section (SF)"
          ),
          wp.element.createElement(SelectControl, {
            label: "Composant",
            value: currentSlug,
            options: options,
            __next40pxDefaultSize: true,
            __nextHasNoMarginBottom: true,
            onChange: function (nextSlug) {
              if (!nextSlug || !parentId) return;
              var sectionBlock = dataSelect("core/block-editor").getBlock(parentId);
              replaceSectionContent(sectionBlock, nextSlug);
            },
          })
        )
      );
    },
    save: function () {
      return null;
    },
  });

  registerSectionVariations();

  addFilter("blocks.createBlock", "sf-tt5/section-init", function (block, name, attributes) {
    if (name !== "core/group") return block;
    var className = attributes && typeof attributes.className === "string" ? attributes.className : "";
    if (className.indexOf("sf-section") === -1) return block;
    if (!block.attributes.layout) {
      block.attributes.layout = { type: "constrained", inherit: false };
    } else if (block.attributes.layout.inherit !== false) {
      block.attributes.layout = Object.assign({}, block.attributes.layout, { inherit: false });
    }
    return block;
  });

  var withSectionControls = createHigherOrderComponent(function (BlockEdit) {
    return function (props) {
      var sectionBlock =
        typeof useSelect === "function"
          ? useSelect(
              function (select) {
                var store = select("core/block-editor");
                if (!store) return null;
                var current = store.getBlock(props.clientId);
                if (isSectionBlock(current)) return current;
                var parents = store.getBlockParents(props.clientId);
                for (var i = 0; i < parents.length; i += 1) {
                  var parentBlock = store.getBlock(parents[i]);
                  if (isSectionBlock(parentBlock)) return parentBlock;
                }
                return null;
              },
              [props.clientId]
            )
          : findSectionTarget(props);

      if (!sectionBlock) {
        return wp.element.createElement(BlockEdit, props);
      }

      sectionBlock = migrateLegacySection(sectionBlock) || sectionBlock;
      if (sectionBlock && sectionBlock.clientId) {
        var layout = sectionBlock.attributes ? sectionBlock.attributes.layout : null;
        if (!layout || layout.inherit !== false) {
          var nextLayout = Object.assign({ type: "constrained" }, layout || {}, { inherit: false });
          dataDispatch("core/block-editor").updateBlockAttributes(sectionBlock.clientId, {
            layout: nextLayout,
          });
        }
      }

      var options =
        typeof useSelect === "function"
          ? useSelect(
              function (select) {
                var patterns = [];
                if (typeof getBlockPatterns === "function") {
                  patterns = patterns.concat(getBlockPatterns() || []);
                }
                var coreSelect = select("core");
                if (coreSelect && typeof coreSelect.getBlockPatterns === "function") {
                  var corePatterns = coreSelect.getBlockPatterns();
                  if (Array.isArray(corePatterns)) {
                    patterns = patterns.concat(corePatterns);
                  }
                }
                var map = {};
                patterns.forEach(function (pattern) {
                  if (pattern && pattern.name) map[pattern.name] = pattern;
                });
                var items = [{ label: "Vide", value: "" }];
                patternCatalog.forEach(function (entry) {
                  items.push({
                    label: entry.label,
                    value: entry.slug,
                    disabled: !map[entry.slug],
                  });
                });
                return items;
              },
              []
            )
          : [{ label: "Vide", value: "" }].concat(
              patternCatalog.map(function (entry) {
                return { label: entry.label, value: entry.slug };
              })
            );
      var controls = options
        .filter(function (opt) {
          return opt.value !== "" && !opt.disabled;
        })
        .map(function (opt) {
          return {
            title: opt.label,
            icon: "update",
            onClick: function () {
              replaceSectionContent(sectionBlock, opt.value);
            },
          };
        });

      var currentSlug =
        (sectionBlock.attributes && sectionBlock.attributes.sfSectionPattern) ||
        getPatternSlugFromClass(
          (sectionBlock.attributes && sectionBlock.attributes.className) || ""
        );

      var hasContent = sectionBlock.innerBlocks && sectionBlock.innerBlocks.length > 0;
      var customValue = currentSlug ? currentSlug : hasContent ? "__custom__" : "";

      var inspectorOptions = options.slice();
      if (customValue === "__custom__") {
        inspectorOptions.unshift({ label: "Composant — Personnalisé", value: "__custom__", disabled: true });
      }

      return wp.element.createElement(
        Fragment,
        null,
        wp.element.createElement(BlockEdit, props),
        wp.element.createElement(
          BlockControls,
          { group: "block" },
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
            { title: "Section — Layout (SF)", initialOpen: true },
            wp.element.createElement(SelectControl, {
              label: "Composant",
              value: customValue,
              options: inspectorOptions,
              __next40pxDefaultSize: true,
              __nextHasNoMarginBottom: true,
              onChange: function (nextSlug) {
                if (nextSlug === "__custom__") return;
                replaceSectionContent(sectionBlock, nextSlug);
              },
            })
          )
        )
      );
    };
  }, "withSectionControls");

  wp.hooks.addFilter("editor.BlockEdit", "sf-tt5/section-controls", withSectionControls);
})(window.wp);
