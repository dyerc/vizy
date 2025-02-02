<template>
    <div class="vui-image-menu-bubble" style="display: none;">
        <a href="#" @click.prevent="imageEditor">{{ 'Image Editor' | t('vizy') }}</a>
        <a href="#" @click.prevent="edit">{{ 'Edit' | t('vizy') }}</a>
        <a href="#" @click.prevent="unlink">{{ 'Delete' | t('vizy') }}</a>

        <image-menu-modal
            v-model="model"
            :show="showEditModal"
            :editor="editor"
            :field="field"
            confirm-button="Update"
            modal-title="Edit Image"
            @close="closeModal"
        />
    </div>
</template>

<script>
import size from 'lodash/size';
import ImageMenuModal from './ImageMenuModal.vue';

import { findChildrenByType } from '@utils/tiptap/nodes';
import followCursor from '@utils/tippy/followCursor';

import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

export default {
    name: 'ImageMenuBubble',

    components: {
        ImageMenuModal,
    },

    props: {
        field: {
            type: Object,
            default: null,
        },

        editor: {
            type: Object,
            default: null,
        },
    },

    data() {
        return {
            tippy: null,
            showEditModal: false,

            model: {
                id: null,
                src: null,
                alt: null,
                title: null,
                url: null,
                target: null,
                transform: null,
            },
        };
    },

    watch: {
        editor: {
            immediate: true,
            handler(editor) {
                if (editor) {
                    this.$nextTick(() => {
                        // Attach a custom event to the editor whenever a image node is clicked
                        editor.on('vui:image-clicked', this.renderBubble);
                    });
                }
            },
        },
    },

    methods: {
        renderBubble(event) {
            const { view } = this.editor;

            // Prevent empty models from proceeding. Happens for nested Vizy fields.
            var model = this.editor.getNodeAttributes('image');

            if (!size(model)) {
                return;
            }

            // Update our model
            this.model = model;

            this.$el.style.display = 'block';

            // Tooltip is created on each click, so destroy
            this.destroyBubble();

            // Attach it to the editor dom, rather than the image node
            this.tippy = tippy(view.dom, {
                content: this.$el,
                trigger: 'manual',
                showOnCreate: true,
                allowHTML: true,
                arrow: true,
                interactive: true,
                placement: 'top',
                followCursor: 'initial',
                plugins: [followCursor],
                theme: 'vui-menu-bubble',
                mouseEvent: event,
                zIndex: 1000,
                appendTo: () => document.body,
            });
        },

        destroyBubble() {
            if (this.tippy) {
                this.tippy.destroy();
                this.tippy = null;
            }
        },

        edit() {
            this.showEditModal = true;

            // Don't destroy, takes focus away from image
            // this.destroyBubble();

            this.editor.chain().blur().run();
        },

        closeModal() {
            this.showEditModal = false;
        },

        imageEditor() {
            if (this.model.id) {
                var settings = {
                    allowSavingAsNew: false,
                    onSave: this.reloadImage.bind(this),
                    allowDegreeFractions: Craft.isImagick,
                };

                new Craft.AssetImageEditor(this.model.id, settings);

                this.destroyBubble();
            }
        },

        reloadImage() {
            const imageNodes = findChildrenByType(this.editor.state.doc, this.editor.schema.nodes.image);

            imageNodes.forEach(node => {
                if (!node.node.attrs.src) {
                    return;
                }

                var matches = node.node.attrs.src.match(/(.*)#asset:(\d+)(:transform:(.*))?/i);

                // Find all instances of THIS asset.
                if (matches && matches[2] == this.model.id) {
                    // Not a transform
                    if (!matches[4]) {
                        var attributes = {
                            src: matches[1] + '?' + (new Date().getTime()) + '#asset:' + matches[2],
                        };

                        this.editor.view.dispatch(this.editor.state.tr.setNodeMarkup(node.pos, null, {
                            ...node.node.attrs,
                            ...attributes,
                        }));
                    } else {
                        var params = {
                            assetId: matches[2],
                            handle: matches[4],
                        };

                        Craft.postActionRequest('assets/generate-transform', params, (data) => {
                            var attributes = {
                                src: data.url + '?' + (new Date().getTime()) + '#asset:' + matches[2] + ':transform:' + matches[4],
                            };

                            this.editor.view.dispatch(this.editor.state.tr.setNodeMarkup(node.pos, null, {
                                ...node.node.attrs,
                                ...attributes,
                            }));
                        });
                    }
                }
            });
        },

        unlink() {
            this.editor.chain().focus().deleteSelection().run();

            this.destroyBubble();
        },
    },

};

</script>

<style lang="scss">

.tippy-box[data-theme~="vui-menu-bubble"] {
    background-color: #1c2e36;
    border-radius: 3px;

    .tippy-arrow {
        z-index: 1;
        pointer-events: none;
    }

    .tippy-content {
        padding: 6px 12px 8px;
        box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.2);
    }

    a {
        font-size: 12px;
        color: #fff;
        text-decoration: none;
        display: inline-block;
        padding: 0 0 0 7px;

        &:hover {
            color: #ddd;
        }

        &:before {
            content: '';
            padding-left: 10px;
            border-left: 1px solid rgba(255,255,255,.3);
        }

        &:first-child {
            padding-left: 0;

            &:before {
                padding-left: 0;
                border-left: none;
            }
        }
    }
}

</style>
