// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Name {
    struct News {
        address add;
        string txt;
        uint time;
    }
    News[] list;

    function create(string memory str, uint256 time) public {
        News memory s = News(msg.sender, str, time);
        list.push(s);
    }

    function get(uint256 page, uint256 size) public view returns (News[] memory) {
        if (page < 1) {
            page = 1;
        }

        if (size < 1) {
            size = 1;
        }

        uint256 total = list.length;

        // 1 * 10 = 10
        uint256 end_index = total - (page - 1) * size;

        if (total < end_index) {
            end_index = total;
        }

        // 10 >= 10 ? 10 - 10
        uint256 start_index = end_index >= size ? end_index - size : 0;

        News[] memory ns = new News[](end_index - start_index);
        for (uint256 x; x < ns.length; x++) {
            ns[x] = list[start_index + x];
        }

        return ns;
    }
}

// 0x1a96b15E992330435d6759f87136a1c85cFf62Fc
//create: 11 3
//get: 1 10
// 0:
// tuple(address,string,uint256)[]: 0xD4897E29A8C5A34ef07D9f241091D73A72FE0653,2,3,0xD4897E29A8C5A34ef07D9f241091D73A72FE0653,3,3,0xD4897E29A8C5A34ef07D9f241091D73A72FE0653,4,3,0xD4897E29A8C5A34ef07D9f241091D73A72FE0653,5,3,0xD4897E29A8C5A34ef07D9f241091D73A72FE0653,6,3,0xD4897E29A8C5A34ef07D9f241091D73A72FE0653,7,3,0xD4897E29A8C5A34ef07D9f241091D73A72FE0653,8,3,0xD4897E29A8C5A34ef07D9f241091D73A72FE0653,9,3,0xD4897E29A8C5A34ef07D9f241091D73A72FE0653,10,3,0xD4897E29A8C5A34ef07D9f241091D73A72FE0653,11,3