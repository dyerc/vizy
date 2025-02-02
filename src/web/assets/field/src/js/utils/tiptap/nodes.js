export const flatten = (node, descend = true) => {
    if (!node) {
        throw new Error('Invalid "node" parameter');
    }

    const result = [];

    node.descendants((child, pos) => {
        result.push({ node: child, pos });
        if (!descend) {
            return false;
        }
    });

    return result;
};

export const findChildren = (node, predicate, descend) => {
    if (!node) {
        throw new Error('Invalid "node" parameter');
    } else if (!predicate) {
        throw new Error('Invalid "predicate" parameter');
    }

    return flatten(node, descend).filter(child => predicate(child.node));
};

export const findTextNodes = (node, descend) => {
    return findChildren(node, child => child.isText, descend);
};

export const findInlineNodes = (node, descend) => {
    return findChildren(node, child => child.isInline, descend);
};

export const findBlockNodes = (node, descend) => {
    return findChildren(node, child => child.isBlock, descend);
};

export const findChildrenByAttr = (node, predicate, descend) => {
    return findChildren(node, child => !!predicate(child.attrs), descend);
};

export const findChildrenByType = (node, nodeType, descend) => {
    return findChildren(node, child => child.type === nodeType, descend);
};

export const findChildrenByMark = (node, markType, descend) => {
    return findChildren(node, child => markType.isInSet(child.marks), descend);
};

export const contains = (node, nodeType) => {
    return !!findChildrenByType(node, nodeType).length;
};
