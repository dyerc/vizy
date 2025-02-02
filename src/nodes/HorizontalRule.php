<?php
namespace verbb\vizy\nodes;

use verbb\vizy\base\Node;

class HorizontalRule extends Node
{
    // Properties
    // =========================================================================

    public static $type = 'horizontalRule';
    public $tagName = 'hr';


    // Public Methods
    // =========================================================================

    public function selfClosing()
    {
        return true;
    }
}
